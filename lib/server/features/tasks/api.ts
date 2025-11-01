import { createClient, createDb } from '@/lib/server/supabase/server';
import { toApiError } from '@/lib/errors';
import type { Task, Subtask, Attachment, TaskStatus, TaskPriority, UserLite } from '@/lib/types';

const TABLE = 'tasks';

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
        task_id, event_id, title, description, task_status, task_priority, start_at, end_at, created_at,
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

// List all User's Tasks (Owner of Event + Assignee)
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

  const {
    data: { user },
    error: uerr,
  } = await root.auth.getUser();
  if (uerr) throw uerr;
  if (!user) throw new Error('UNAUTHORIZED');

  const SEL_WITH_USER =
    `
    task_id, event_id, title, description, task_status, task_priority, start_at, end_at, created_at,
    attachments:attachments ( attachment_id, attachment_url ),
    subtasks:subtasks ( subtask_id, title, subtask_status ),
    assignees:task_assignees (
      assigned_at,
      user:users!task_assignees_user_id_fkey ( user_id, username, email, avatar_url )
    ),
    event:events!tasks_event_id_fkey ( event_id, owner_id, title )
    ` as const;

  // 1) All tasks in the event that we own (not necessarily inner assignees)
  let ownerQ = db
    .from(TABLE)
    .select(SEL_WITH_USER)
    .eq('event.owner_id', user.id)
    .order('created_at', { ascending: false });
  if (params.status) ownerQ = ownerQ.eq('task_status', params.status);
  if (params.q) ownerQ = ownerQ.ilike('title', `%${params.q}%`);

  // 2) The tasks we are assignee of
  const SEL_ASSIGNEE_INNER = SEL_WITH_USER.replace(
    'assignees:task_assignees (',
    'assignees:task_assignees!inner ('
  ) as typeof SEL_WITH_USER;

  let assigneeQ = db
    .from(TABLE)
    .select(SEL_ASSIGNEE_INNER)
    .eq('assignees.user_id', user.id)
    .order('created_at', { ascending: false });
  if (params.status) assigneeQ = assigneeQ.eq('task_status', params.status);
  if (params.q) assigneeQ = assigneeQ.ilike('title', `%${params.q}%`);

  const [{ data: dOwner, error: eOwner }, { data: dAssign, error: eAssign }] = await Promise.all([
    ownerQ,
    assigneeQ,
  ]);
  if (eOwner) throw eOwner;
  if (eAssign) throw eAssign;

  // Merge + dedupe by task_id
  const merged = [...(dOwner ?? []), ...(dAssign ?? [])] as unknown as RawTaskRow[];
  const byId = new Map<string, RawTaskRow>();
  for (const r of merged) {
    const k = String(r.task_id);
    if (!byId.has(k)) byId.set(k, r);
  }

  // Sort by created_at then paginate
  const all = Array.from(byId.values()).sort((a, b) =>
    String(b.created_at).localeCompare(String(a.created_at))
  );
  const start = (page - 1) * pageSize;
  const end = start + pageSize;

  return {
    items: all.slice(start, end).map(map),
    nextPage: end < all.length ? page + 1 : null,
  };
}

// Create new Event Task with attachments/subtasks/assignees
export async function createEventTask(eventId: string, input: Task): Promise<Task> {
  const db = await createDb();

  try {
    // 1) create task
    const { data: trow, error: e1 } = await db
      .from(TABLE)
      .insert({
        event_id: eventId ?? null,
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

    // 2) assignees (pivot)
    if (input.assignees?.length) {
      const rows = input.assignees.map((uid) => ({
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
        task_id, event_id, title, description, task_status, task_priority, start_at, end_at, created_at,
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
    const given = Array.isArray(input.assignees) ? input.assignees.map(String) : [];
    const assignees = Array.from(new Set([...given, String(user.id)]));

    // 1) create task (no event)
    const { data: trow, error: e1 } = await db
      .from(TABLE)
      .insert({
        event_id: null,
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
        task_id, event_id, title, description, task_status, task_priority, start_at, end_at, created_at,
        attachments:attachments ( attachment_id, attachment_url ),
        subtasks:subtasks ( subtask_id, title, subtask_status ),
        assignees:task_assignees (
          assigned_at,
          user:users!task_assignees_user_id_fkey ( user_id, username, email, avatar_url )
        )
      `
      )
      .eq('task_id', taskId)
      .single();
    if (error) throw error;

    const row = data as unknown as RawTaskRow;
    return map(row);
  } catch (e) {
    throw toApiError(e, 'TASK_CREATE_FAILED');
  }
}

// Update Task (+ optional replace assignees)
export async function updateTask(
  taskId: string,
  patch: Partial<Task> & { assigneesReplace?: string[] }
): Promise<Task> {
  const db = await createDb();

  try {
    const updateRow: Record<string, unknown> = {};
    if (patch.title !== undefined) updateRow.title = patch.title;
    if (patch.description !== undefined) updateRow.description = patch.description;
    if (patch.taskStatus !== undefined) updateRow.task_status = patch.taskStatus;
    if (patch.taskPriority !== undefined) updateRow.task_priority = patch.taskPriority;
    if (patch.startAt !== undefined) updateRow.start_at = patch.startAt;
    if (patch.endAt !== undefined) updateRow.end_at = patch.endAt;

    if (Object.keys(updateRow).length) {
      const { error } = await db.from(TABLE).update(updateRow).eq('task_id', taskId);
      if (error) throw error;
    }

    if (patch.assigneesReplace) {
      const { error: dErr } = await db.from('task_assignees').delete().eq('task_id', taskId);
      if (dErr) throw dErr;

      if (patch.assigneesReplace.length) {
        const rows = patch.assigneesReplace.map((uid) => ({
          task_id: taskId,
          user_id: uid,
          assigned_at: new Date().toISOString(),
        }));
        const { error: iErr } = await db.from('task_assignees').insert(rows);
        if (iErr) throw iErr;
      }
    }

    const { data, error } = await db
      .from(TABLE)
      .select(
        `
        task_id, event_id, title, description, task_status, task_priority, start_at, end_at, created_at,
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
    return map(fetchedRow);
  } catch (e) {
    throw toApiError(e, 'TASK_UPDATE_FAILED');
  }
}

export async function deleteTask(taskId: string): Promise<void> {
  const db = await createDb();
  try {
    const { error } = await db.from(TABLE).delete().eq('task_id', taskId);
    if (error) throw error;
  } catch (e) {
    throw toApiError(e, 'TASK_DELETE_FAILED');
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
  // Supabase relation can return an object or an array (if configured) — handle both
  user: RawUserRow | RawUserRow[] | null;
};

type RawAttachmentRow = {
  attachment_id: string;
  attachment_url: string;
};

type RawSubtaskRow = {
  subtask_id: string;
  title: string;
  // กำหนดให้เป็นชนิดเดียวกับ Subtask['subtaskStatus'] เพื่อตัด cast any
  subtask_status: Subtask['subtaskStatus'];
};

type RawTaskRow = {
  task_id: string;
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
