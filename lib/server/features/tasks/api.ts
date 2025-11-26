import { createClient, createDb } from '@/lib/server/supabase/server';
import { toApiError } from '@/lib/errors';
import type { Task, Subtask, Attachment, TaskStatus, TaskPriority, UserLite } from '@/lib/types';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { logActivity } from '@/lib/server/features/activities/logger';

const TABLE = 'tasks';

// ---------- Tasks ----------

// Get a single task by ID
export async function getTaskById(taskId: string): Promise<Task> {
  const db = await createDb();

  try {
    const { data, error } = await db
      .from(TABLE)
      .select(
        `
        task_id, creator_id, event_id, title, description, task_status, task_priority, start_at, end_at, created_at,
        attachments:attachments ( attachment_id, attachment_url ),
        subtasks:subtasks ( subtask_id, title, subtask_status ),
        assignees:task_assignees (
          assigned_at,
          user:users!task_assignees_user_id_fkey ( user_id, username, email, avatar_url )
        ),
        event:events!tasks_event_id_fkey ( event_id, owner_id, title )
        `
      )
      .eq('task_id', taskId)
      .single();

    if (error) throw error;

    const row = data as unknown as RawTaskRow;
    return map(row);
  } catch (e) {
    throw toApiError(e, 'TASK_FETCH_FAILED');
  }
}

// List Task of a single Event (For the Event Detail page)
export async function listEventTasks(params: {
  eventId: string;
  status?: Task['taskStatus'];
  q?: string;
  page?: number;
  pageSize?: number;
}): Promise<{ items: Task[]; nextPage: number | null }> {
  const db = await createDb();

  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 10;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  try {
    let qy = db
      .from(TABLE)
      .select(
        `
        task_id, creator_id, event_id, title, description, task_status, task_priority, start_at, end_at, created_at,
        subtasks:subtasks ( subtask_id, title, subtask_status ),
        attachments:attachments ( attachment_id, attachment_url ),
        assignees:task_assignees (
          assigned_at,
          user:users!task_assignees_user_id_fkey ( user_id, username, email, avatar_url )
        )
      `,
        { count: 'exact' }
      )
      .eq('event_id', params.eventId)
      .order('created_at', { ascending: false });

    if (params.status) qy = qy.eq('task_status', params.status);
    if (params.q) qy = qy.ilike('title', `%${params.q}%`);

    const { data, error, count } = await qy.range(from, to);
    if (error) throw error;

    const rows = (data ?? []) as unknown as RawTaskRow[];
    const items = rows.map(map);
    const total = count ?? 0;
    const maxPage = Math.max(1, Math.ceil(total / pageSize));
    return { items, nextPage: page < maxPage ? page + 1 : null };
  } catch (e) {
    throw toApiError(e, 'TASKS_LIST_FAILED');
  }
}

// List all User's Tasks (Owner of Event + Assignee + Personal Task)
export async function listAllUserTasks(params: {
  q?: string;
  status?: Task['taskStatus'];
  page?: number;
  pageSize?: number;
}): Promise<{ items: Task[]; nextPage: number | null }> {
  const root = await createClient();
  const db = await createDb();

  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 10;
  
  const to = (page * pageSize) - 1; 

  const {
    data: { user },
    error: uerr,
  } = await root.auth.getUser();
  if (uerr) throw uerr;
  if (!user) throw new Error('UNAUTHORIZED');

  const SEL_BASE = `
    task_id, creator_id, event_id, title, description, task_status, task_priority, start_at, end_at, created_at,
    attachments:attachments ( attachment_id, attachment_url ),
    subtasks:subtasks ( subtask_id, title, subtask_status ),
    assignees:task_assignees (
      assigned_at,
      user:users!task_assignees_user_id_fkey ( user_id, username, email, avatar_url )
    ),
    event:events!tasks_event_id_fkey ( event_id, owner_id, title )
  `;

  // 1. Owner of Event Tasks
  const SEL_EVENT_OWNER = SEL_BASE.replace(
    'event:events!tasks_event_id_fkey (',
    'event:events!tasks_event_id_fkey!inner ('
  );
  
  let ownerQ = db
    .from(TABLE)
    .select(SEL_EVENT_OWNER)
    .eq('event.owner_id', user.id)
    .order('created_at', { ascending: false })
    .range(0, to); 

  // 2. Assignee Tasks (The task which user was assigned)
  const SEL_ASSIGNEE_INNER = SEL_BASE.replace(
    'assignees:task_assignees (',
    'assignees:task_assignees!inner ('
  );

  let assigneeQ = db
    .from(TABLE)
    .select(SEL_ASSIGNEE_INNER)
    .eq('assignees.user_id', user.id)
    .order('created_at', { ascending: false })
    .range(0, to);

  // 3. Personal Tasks
  // Event == NULL && Creator is the user
  let personalQ = db
    .from(TABLE)
    .select(SEL_BASE)
    .is('event_id', null)       
    .eq('creator_id', user.id) 
    .order('created_at', { ascending: false })
    .range(0, to);

  // Apply Filters (Search & Status) to all queries
  if (params.status) {
    ownerQ = ownerQ.eq('task_status', params.status);
    assigneeQ = assigneeQ.eq('task_status', params.status);
    personalQ = personalQ.eq('task_status', params.status);
  }
  if (params.q) {
    const searchStr = `%${params.q}%`;
    ownerQ = ownerQ.ilike('title', searchStr);
    assigneeQ = assigneeQ.ilike('title', searchStr);
    personalQ = personalQ.ilike('title', searchStr);
  }

  const [
    { data: dOwner, error: eOwner }, 
    { data: dAssign, error: eAssign },
    { data: dPersonal, error: ePersonal }
  ] = await Promise.all([
    ownerQ,
    assigneeQ,
    personalQ
  ]);

  if (eOwner) throw eOwner;
  if (eAssign) throw eAssign;
  if (ePersonal) throw ePersonal;

  const merged = [
    ...(dOwner ?? []), 
    ...(dAssign ?? []),
    ...(dPersonal ?? [])
  ] as unknown as RawTaskRow[];

  const byId = new Map<string, RawTaskRow>();
  for (const r of merged) {
    const k = String(r.task_id);
    if (!byId.has(k)) byId.set(k, r);
  }

  const all = Array.from(byId.values()).sort((a, b) =>
    String(b.created_at).localeCompare(String(a.created_at))
  );
  
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  
  const hasNextPage = all.length > end;

  return {
    items: all.slice(start, end).map(map),
    nextPage: hasNextPage ? page + 1 : null,
  };
}

// Create new Event Task with attachments/subtasks/assignees
export async function createEventTask(eventId: string, input: Task): Promise<Task> {
  const root = await createClient();
  const { data: { user } } = await root.auth.getUser();
  const db = await createDb();

  if (!user) throw new Error('UNAUTHORIZED'); 

  try {
    // 1) create task
    const { data: trow, error: e1 } = await db
      .from(TABLE)
      .insert({
        event_id: eventId ?? null,
        creator_id: user.id,
        title: input.title,
        description: input.description ?? null,
        task_status: input.taskStatus,
        task_priority: input.taskPriority,
        start_at: input.startAt ?? null,
        end_at: input.endAt ?? null,
      })
      .select('task_id')
      .single();
    if (e1) throw e1;

    const taskId = String(trow.task_id);

    // 2) assignees
    if (input.assignees && input.assignees.length > 0) {
      const rows = input.assignees.map((a: string | UserLite) => ({
        task_id: taskId,
        user_id: typeof a === 'string' ? a : a.userId, 
        assigned_at: new Date().toISOString(),
      }));
      const { error } = await db.from('task_assignees').insert(rows);
      if (error) throw error;
    }

    // 3) subtasks
    if (input.subtasks?.length) {
      const rows = input.subtasks.map((s) => ({
        task_id: taskId,
        title: s.title,
        subtask_status: s.subtaskStatus,
      }));
      const { error } = await db.from('subtasks').insert(rows);
      if (error) throw error;
    }

    // 4) attachments
    if (input.attachments?.length) {
      const rows = input.attachments.map((a) => ({
        task_id: taskId,
        attachment_url: a.attachmentUrl,
      }));
      const { error } = await db.from('attachments').insert(rows);
      if (error) throw error;
    }

    // 5) fetch full
    const { data, error } = await db
      .from(TABLE)
      .select(
        `
        task_id, creator_id, event_id, title, description, task_status, task_priority, start_at, end_at, created_at,
        attachments:attachments ( attachment_id, attachment_url ),
        subtasks:subtasks ( subtask_id, title, subtask_status ),
        assignees:task_assignees (
          assigned_at,
          user:users!task_assignees_user_id_fkey ( user_id, username, email, avatar_url )
        ),
        event:events!tasks_event_id_fkey ( title )
      `
      )
      .eq('task_id', taskId)
      .single();
    if (error) throw error;

    const row = data as unknown as RawTaskRow;

    // Log Activity
    if (user && eventId) {
      await logActivity(user.id, eventId, 'CREATE_TASK', 'TASK', input.title);
    }

    return map(row);
  } catch (e) {
    throw toApiError(e, 'TASK_CREATE_FAILED');
  }
}

// Create new Personal Task (no event)
export async function createPersonalTask(
  input: Omit<Task, 'taskId' | 'eventId' | 'eventTitle'>
): Promise<Task> {
  const root = await createClient();
  const db = await createDb();

  try {
    const {
      data: { user },
      error: uerr,
    } = await root.auth.getUser();
    if (uerr) throw uerr;
    if (!user) throw new Error('UNAUTHORIZED');

    // ensure creator is in assignees
    const assigneesInput = input.assignees as unknown as (string | UserLite)[];
    const given = Array.isArray(assigneesInput)
      ? assigneesInput.map((a) => (typeof a === 'string' ? a : a.userId))
      : [];
    const assignees = Array.from(new Set([...given, String(user.id)]));

    // 1) create task (no event)
    const { data: trow, error: e1 } = await db
      .from(TABLE)
      .insert({
        event_id: null,
        creator_id: user.id, 
        title: input.title,
        description: input.description ?? null,
        task_status: input.taskStatus,
        task_priority: input.taskPriority,
        start_at: input.startAt ?? null,
        end_at: input.endAt ?? null,
      })
      .select('task_id')
      .single();
    if (e1) throw e1;

    const taskId = String(trow.task_id);

    // 2) assignees
    if (assignees.length) {
      const rows = assignees.map((uid) => ({
        task_id: taskId,
        user_id: uid,
        assigned_at: new Date().toISOString(),
      }));
      const { error } = await db.from('task_assignees').insert(rows);
      if (error) throw error;
    }

    // 3) subtasks
    if (input.subtasks?.length) {
      const rows = input.subtasks.map((s) => ({
        task_id: taskId,
        title: s.title,
        subtask_status: s.subtaskStatus,
      }));
      const { error } = await db.from('subtasks').insert(rows);
      if (error) throw error;
    }

    // 4) attachments
    if (input.attachments?.length) {
      const rows = input.attachments.map((a) => ({
        task_id: taskId,
        attachment_url: a.attachmentUrl,
      }));
      const { error } = await db.from('attachments').insert(rows);
      if (error) throw error;
    }

    // 5) fetch full
    const { data, error } = await db
      .from(TABLE)
      .select(
        `
        task_id, event_id, creator_id, title, description, task_status, task_priority, start_at, end_at, created_at,
        attachments:attachments ( attachment_id, attachment_url ),
        subtasks:subtasks ( subtask_id, title, subtask_status ),
        assignees:task_assignees (
          assigned_at,
          user:users!task_assignees_user_id_fkey ( user_id, username, email, avatar_url )
        ),
        event:events!tasks_event_id_fkey ( title )
      `
      )
      .eq('task_id', taskId)
      .single();
    if (error) throw error;

    const row = data as unknown as RawTaskRow;

    if (user) {
      await logActivity(
        user.id, 
        null, 
        'CREATE_TASK', 
        'TASK', 
        input.title
      );
    }

    return map(row);
  } catch (e) {
    throw toApiError(e, 'TASK_CREATE_FAILED');
  }
}

// Update Task (Bulk Update: Assignees, Subtasks, Attachments)
export async function updateTask(
  taskId: string,
  patch: Partial<Task>
): Promise<Task> {
  const root = await createClient();
  const { data: { user } } = await root.auth.getUser();
  const db = await createDb();

  try {
    // 1. Update Main Task Fields
    const updateRow: Record<string, unknown> = {};
    if (patch.title !== undefined) updateRow.title = patch.title;
    if (patch.description !== undefined) updateRow.description = patch.description;
    if (patch.taskStatus !== undefined) updateRow.task_status = patch.taskStatus;
    if (patch.taskPriority !== undefined) updateRow.task_priority = patch.taskPriority;
    if (patch.startAt !== undefined) updateRow.start_at = patch.startAt;
    if (patch.endAt !== undefined) updateRow.end_at = patch.endAt;

    if (Object.keys(updateRow).length) {
      const { data: updatedRows, error } = await db
        .from(TABLE)
        .update(updateRow)
        .eq('task_id', taskId)
        .select('task_id'); 

      if (error) throw error;

      if (!updatedRows || updatedRows.length === 0) {
        console.error(`Update failed for task ${taskId}. Reason: Task not found OR RLS permission denied.`);
        throw new Error('PERMISSION_DENIED_OR_NOT_FOUND');
      }
    }

    // 2. Bulk Update: Assignees
    if (patch.assignees) {
      // Delete all old ones and replace them (Strategy: Replace All)
      const { error: dErr } = await db.from('task_assignees').delete().eq('task_id', taskId);
      if (dErr) throw dErr;

      if (patch.assignees.length > 0) {
        const rows = patch.assignees.map((u) => ({
          task_id: taskId,
          user_id: u.userId, 
          assigned_at: new Date().toISOString(),
        }));
        const { error: iErr } = await db.from('task_assignees').insert(rows);
        if (iErr) throw iErr;
      }
    }

    // 3. Bulk Update: Subtasks
    if (patch.subtasks) {
      // 3.1 Find the ID of the submitted (existing) Subtask.
      const incomingIds = patch.subtasks
        .map(s => s.subtaskId)
        .filter(id => id && id.length > 10);

      // 3.2 Delete Subtasks in the DB that are not in the new list (Delete missing)
      if (incomingIds.length > 0) {
        await db.from('subtasks').delete().eq('task_id', taskId).not('subtask_id', 'in', `(${incomingIds.join(',')})`);
      } else {
         if (patch.subtasks.length === 0) {
             await db.from('subtasks').delete().eq('task_id', taskId);
         }
      }

      // 3.3 Upsert (Update existing + Insert new)
      for (const s of patch.subtasks) {
        if (s.subtaskId && s.subtaskId.length > 10) {
          // Update Existing
          await db.from('subtasks').update({
            title: s.title,
            subtask_status: s.subtaskStatus
          }).eq('subtask_id', s.subtaskId);
        } else {
          // Insert New
          await db.from('subtasks').insert({
            task_id: taskId,
            title: s.title,
            subtask_status: s.subtaskStatus
          });
        }
      }
    }

    // 4. Bulk Update: Attachments
    if (patch.attachments) {
      const incomingIds = patch.attachments
        .map(a => a.attachmentId)
        .filter(id => id && id.length > 10);

      // 4.1 Delete missing
      if (incomingIds.length > 0) {
        await db.from('attachments').delete().eq('task_id', taskId).not('attachment_id', 'in', `(${incomingIds.join(',')})`);
      } else if (patch.attachments.length === 0) {
        await db.from('attachments').delete().eq('task_id', taskId);
      }

      // 4.2 Insert New only (Attachments usually don't update URL)
      const newAttachments = patch.attachments.filter(a => !a.attachmentId || a.attachmentId.length < 10);
      if (newAttachments.length > 0) {
        const rows = newAttachments.map(a => ({
          task_id: taskId,
          attachment_url: a.attachmentUrl
        }));
        await db.from('attachments').insert(rows);
      }
    }

    // 5. Fetch Final Result
    const { data, error } = await db
      .from(TABLE)
      .select(
        `
        task_id, creator_id, event_id, title, description, task_status, task_priority, start_at, end_at, created_at,
        attachments:attachments ( attachment_id, attachment_url ),
        subtasks:subtasks ( subtask_id, title, subtask_status ),
        assignees:task_assignees (
          assigned_at,
          user:users!task_assignees_user_id_fkey ( user_id, username, email, avatar_url )
        ),
        event:events!tasks_event_id_fkey ( title )
      `
      )
      .eq('task_id', taskId)
      .single();
    if (error) throw error;

    const fetchedRow = data as unknown as RawTaskRow;

    // Log Activity 
    if (user) {
      await logActivity(
        user.id, 
        fetchedRow.event_id ?? null, 
        'UPDATE_TASK', 
        'TASK', 
        fetchedRow.title
      );
    }

    return map(fetchedRow);
  } catch (e) {
    throw toApiError(e, 'TASK_UPDATE_FAILED');
  }
}

export async function deleteTask(taskId: string): Promise<void> {
const root = await createClient();
  const { data: { user }, error: authError } = await root.auth.getUser();
  if (authError || !user) throw new Error('UNAUTHORIZED');

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error("Missing SUPABASE_SERVICE_ROLE_KEY");
    throw new Error("SERVER_CONFIGURATION_ERROR");
  }

  const adminDb = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );

  try {
    const { data: task, error: findError } = await adminDb
      .from(TABLE)
      .select(`
        task_id, 
        event_id,
        title,
        event:events!tasks_event_id_fkey(owner_id),
        assignees:task_assignees(user_id)
      `)
      .eq('task_id', taskId)
      .maybeSingle();

    if (findError) throw findError;
    if (!task) throw new Error('TASK_NOT_FOUND');

    type TaskWithOwnership = {
      event_id: string | null;
      title: string;
      event: { owner_id: string } | { owner_id: string }[] | null;
      assignees: { user_id: string }[];
    }

    const taskData = task as unknown as TaskWithOwnership;
    
    const eventData = Array.isArray(taskData.event) ? taskData.event[0] : taskData.event;

    const isEventOwner = eventData?.owner_id === user.id;
    
    const isAssignee = Array.isArray(taskData.assignees)
      ? taskData.assignees.some((a) => a.user_id === user.id)
      : false;

    if (!isEventOwner && !isAssignee) {
      throw new Error('FORBIDDEN_DELETE');
    }

    const taskTitle = taskData.title;
    const eventId = taskData.event_id;

    const { error: deleteError } = await adminDb.from(TABLE).delete().eq('task_id', taskId);

    if (deleteError) throw deleteError;

    await logActivity(
        user.id, 
        eventId ?? null, 
        'DELETE_TASK', 
        'TASK', 
        taskTitle
    );

  } catch (e) {
    throw toApiError(e, 'TASK_DELETE_FAILED');
  }
}

// ---------- Subtasks ----------

export async function createSubtask(
  taskId: string, 
  title: string, 
  status: Subtask['subtaskStatus'] = 'To Do' // 'To Do' as Default
): Promise<Subtask> {
  const db = await createDb();

  const root = await createClient();
  const { data: { user } } = await root.auth.getUser();

  try {
    // Pull the parent task data to find the event_id (cannot be done simultaneously with insert, must query separately or use select nested)
    const { data: parentTask } = await db.from('tasks').select('event_id').eq('task_id', taskId).single();

    const { data, error } = await db
      .from('subtasks')
      .insert({ task_id: taskId, title: title, subtask_status: status })
      .select('subtask_id, title, subtask_status')
      .single();

    if (error) throw error; 

    // Log Activity
    if (user) {
        await logActivity(
            user.id, 
            parentTask?.event_id ?? null, 
            'CREATE_SUBTASK', 
            'SUBTASK', 
            title,
            { parentTaskId: taskId }
        );
    }

    return {
      subtaskId: String(data.subtask_id),
      taskId: taskId,
      title: data.title,
      subtaskStatus: data.subtask_status,
    };
  } catch (e) {
    throw toApiError(e, 'SUBTASK_CREATE_FAILED');
  }
}

export async function updateSubtask(
  subtaskId: string,
  patch: { title?: string; subtaskStatus?: Subtask['subtaskStatus'] }
): Promise<Subtask> {
  const db = await createDb();

  const root = await createClient();
  const { data: { user } } = await root.auth.getUser();

  try {
    const updateData: Record<string, unknown> = {};
    if (patch.title !== undefined) updateData.title = patch.title;
    if (patch.subtaskStatus !== undefined) updateData.subtask_status = patch.subtaskStatus;

    const { data, error } = await db
      .from('subtasks')
      .update(updateData)
      .eq('subtask_id', subtaskId)
      .select(`
        subtask_id, task_id, title, subtask_status,
        task:tasks(event_id) 
      `)
      .single();

    if (error) throw error;

    // Supabase return relation 'task' as object or array
    const result = data as unknown as {
        subtask_id: string, 
        task_id: string, 
        title: string, 
        subtask_status: Subtask['subtaskStatus'],
        task: { event_id: string | null } | { event_id: string | null }[]
    };

    const taskObj = Array.isArray(result.task) ? result.task[0] : result.task;
    const eventId = taskObj?.event_id ?? null;

    if (user) {
        await logActivity(user.id, eventId, 'UPDATE_SUBTASK', 'SUBTASK', result.title);
    }

    return {
      subtaskId: String(result.subtask_id),
      taskId: String(result.task_id),
      title: result.title,
      subtaskStatus: result.subtask_status,
    };
  } catch (e) {
    throw toApiError(e, 'SUBTASK_UPDATE_FAILED');
  }
}

export async function deleteSubtask(subtaskId: string): Promise<void> {
  const db = await createDb();

  const root = await createClient();
  const { data: { user } } = await root.auth.getUser();

  try {
    const { data: subtask } = await db
        .from('subtasks')
        .select('title, task:tasks(event_id)')
        .eq('subtask_id', subtaskId)
        .single();

    const { error } = await db.from('subtasks').delete().eq('subtask_id', subtaskId);
    if (error) throw error;

    // Map type to retrieve values ​​for use in log
    const result = subtask as unknown as {
        title: string,
        task: { event_id: string | null } | { event_id: string | null }[]
    };

    const taskObj = Array.isArray(result.task) ? result.task[0] : result.task;
    const eventId = taskObj?.event_id ?? null;
    const title = result.title || 'Unknown Subtask';

    if (user) {
        await logActivity(user.id, eventId, 'DELETE_SUBTASK', 'SUBTASK', title);
    }

  } catch (e) {
    throw toApiError(e, 'SUBTASK_DELETE_FAILED');
  }
}

// ---------- Raw types ----------
type RawUserRow = {
  user_id: string;
  username: string | null;
  email: string | null;
  avatar_url: string | null;
};

type RawAssigneeRow = {
  assigned_at: string;
  user: RawUserRow | RawUserRow[] | null;
};

type RawAttachmentRow = {
  attachment_id: string;
  attachment_url: string;
};

type RawSubtaskRow = {
  subtask_id: string;
  title: string;
  subtask_status: Subtask['subtaskStatus'];
};

type RawTaskRow = {
  task_id: string;
  creator_id?: string | null;
  event_id?: string | null;
  title: string;
  description?: string | null;
  task_status: TaskStatus;
  task_priority: TaskPriority;
  start_at?: string | null;
  end_at?: string | null;
  created_at: string;
  attachments?: RawAttachmentRow[] | null;
  subtasks?: RawSubtaskRow[] | null;
  assignees?: RawAssigneeRow[] | null;
  event?: { event_id: string; owner_id: string; title: string } | null;
};

// ---------- Mapper ----------
function map(r: RawTaskRow): Task {
  const assignees = (r.assignees ?? [])
    .map((a): UserLite | null => {
      const u = a.user;
      const userObj: RawUserRow | null = Array.isArray(u) ? (u[0] ?? null) : u;
      return userObj
        ? {
            userId: String(userObj.user_id),
            username: String(userObj.username ?? ''),
            email: String(userObj.email ?? ''),
            avatarUrl: userObj.avatar_url ?? null,
          }
        : null;
    })
    .filter((v): v is UserLite => v !== null);

  return {
    taskId: String(r.task_id),
    eventId: r.event_id ?? null,
    eventTitle: r.event?.title ?? undefined,
    title: r.title,
    description: r.description ?? '',
    taskStatus: r.task_status,
    taskPriority: r.task_priority,
    startAt: r.start_at ?? null,
    endAt: r.end_at ?? null,
    createdAt: r.created_at,
    attachments: (r.attachments ?? []).map(mapAttachment),
    subtasks: (r.subtasks ?? []).map(mapSubtask),
    assignees,
    creatorId: r.creator_id ?? null, 
  };
}

function mapAttachment(a: RawAttachmentRow): Attachment {
  return {
    attachmentId: String(a.attachment_id),
    taskId: '',
    attachmentUrl: String(a.attachment_url),
  };
}

function mapSubtask(s: RawSubtaskRow): Subtask {
  return {
    subtaskId: String(s.subtask_id),
    taskId: '',
    title: s.title,
    subtaskStatus: s.subtask_status,
  };
}
