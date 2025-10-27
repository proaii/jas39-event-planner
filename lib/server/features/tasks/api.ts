import { createClient } from '@/lib/server/supabase/server';
import { toApiError } from '@/lib/errors';
import type { Task, SubTask, Attachment, TaskStatus, TaskPriority } from '@/lib/types';

const TABLE = 'tasks';

// List Task of a single Event (For the Event Detail page)
export async function listEventTasks(params: {
  eventId: string;
  status?: Task['status'];
  q?: string;
  page?: number;
  pageSize?: number;
}): Promise<{ items: Task[]; nextPage: number | null }> {
  const supabase = await createClient();
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 10;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  try {
    let qy = supabase
      .from(TABLE)
      .select(
        `
        *,
        attachments(*),
        sub_tasks(*)
      `,
        { count: 'exact' }
      )
      .eq('event_id', params.eventId)
      .order('created_at', { ascending: false });

    if (params.status) qy = qy.eq('status', params.status);
    if (params.q) qy = qy.ilike('name', `%${params.q}%`);

    const { data, error, count } = await qy.range(from, to);
    if (error) throw error;

    const items = (data ?? []).map(map);
    const total = count ?? 0;
    const maxPage = Math.max(1, Math.ceil(total / pageSize));
    return { items, nextPage: page < maxPage ? page + 1 : null };
  } catch (e) {
    throw toApiError(e, 'TASKS_LIST_FAILED');
  }
}

// List all User's Tasks (Personal + Assignee) (For the All Tasks page)
export async function listAllUserTasks(params: {
  q?: string;
  status?: Task['status'];
  page?: number;
  pageSize?: number;
}): Promise<{ items: Task[]; nextPage: number | null }> {
  const supabase = await createClient();
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 10;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  try {
    const { data: { user }, error: uerr } = await supabase.auth.getUser();
    if (uerr) throw uerr;
    if (!user) throw new Error('UNAUTHORIZED');

    let qy = supabase
      .from(TABLE)
      .select(`
        *,
        attachments(*),
        sub_tasks(*),
        event:events!tasks_event_id_fkey(id, owner_id, title)
      `, { count: 'exact' })
      .contains('assignees', [String(user.id)]) // Only the tasks where user is assignee
      .not('event.owner_id', 'eq', user.id) // Exclude the tasks where event.owner_id is user
      .order('created_at', { ascending: false });

    if (params.status) qy = qy.eq('status', params.status);
    if (params.q) qy = qy.ilike('name', `%${params.q}%`);

    const { data, error, count } = await qy.range(from, to);
    if (error) throw error;

    const items = (data ?? []).map(map);
    const total = count ?? 0;
    const maxPage = Math.max(1, Math.ceil(total / pageSize));
    return { items, nextPage: page < maxPage ? page + 1 : null };
  } catch (e) {
    throw toApiError(e, 'ALL_TASKS_LIST_FAILED');
  }
}

// Create new Event Task with attachments/subTasks (For Event Detail page)
export async function createEventTask(eventId: string, input: Task): Promise<Task> {
  const supabase = await createClient();
  try {
    const { data: newId, error: rpcErr } = await supabase.rpc<string, {
      p_event_id: string | null;
      p_task: Record<string, unknown>;
    }>('create_task_with_children', {
      p_event_id: eventId,
      p_task: toRpcTaskPayload(input),
    });
    if (rpcErr) throw rpcErr;

    const { data, error } = await supabase
      .from(TABLE)
      .select(`*, attachments(*), sub_tasks(*), event:events!tasks_event_id_fkey(title)`)
      .eq('id', newId)
      .single<RawTaskRow>();

    if (error) throw error;
    return map(data);
  } catch (e) {
    throw toApiError(e, 'TASK_CREATE_FAILED');
  }
}

// Create new Personal Task with attachments/subTasks (For Tasks page)  
export async function createPersonalTask(
  input: Omit<Task, 'id' | 'eventId' | 'eventTitle'>
): Promise<Task> {
  const supabase = await createClient();
  try {
    const { data: { user }, error: uerr } = await supabase.auth.getUser();
    if (uerr) throw uerr;
    if (!user) throw new Error('UNAUTHORIZED');

    const myId = String(user.id);
    const given = Array.isArray(input.assignees) ? input.assignees.map(String) : [];
    const assignees = Array.from(new Set([...given, myId]));

    const payload = toRpcTaskPayload({ ...input, assignees, isPersonal: true } as Task);

    const { data: newId, error: rpcErr } = await supabase.rpc<string, {
      p_event_id: string | null;
      p_task: Record<string, unknown>;
    }>('create_task_with_children', {
      p_event_id: null,
      p_task: payload,
    });
    if (rpcErr) throw rpcErr;

    const { data, error } = await supabase
      .from(TABLE)
      .select(`*, attachments(*), sub_tasks(*)`)
      .eq('id', newId)
      .single<RawTaskRow>();
    if (error) throw error;

    return map(data);
  } catch (e) {
    throw toApiError(e, 'TASK_CREATE_FAILED');
  }
}

// Update Task (excluding subTasks / attachments)
export async function updateTask(taskId: string, patch: Partial<Task>): Promise<Task> {
  const supabase = await createClient();
  try {
    const row: Record<string, unknown> = {};

    if (patch.name !== undefined) row.name = patch.name;
    if (patch.description !== undefined) row.description = patch.description;
    if (patch.assignees !== undefined) row.assignees = patch.assignees;
    if (patch.dueDate !== undefined) row.due_date = patch.dueDate;
    if (patch.startDate !== undefined) row.start_date = patch.startDate;
    if (patch.endDate !== undefined) row.end_date = patch.endDate;
    if (patch.startTime !== undefined) row.start_time = patch.startTime;
    if (patch.endTime !== undefined) row.end_time = patch.endTime;
    if (patch.status !== undefined) row.status = patch.status;
    if (patch.priority !== undefined) row.priority = patch.priority;
    if (patch.isPersonal !== undefined) row.is_personal = patch.isPersonal;

    const { data, error } = await supabase
      .from(TABLE)
      .update(row)
      .eq('id', taskId)
      .select('*')
      .single();

    if (error) throw error;
    return map(data);
  } catch (e) {
    throw toApiError(e, 'TASK_UPDATE_FAILED');
  }
}

export async function deleteTask(taskId: string): Promise<void> {
  const supabase = await createClient();
  try {
    const { error } = await supabase.from(TABLE).delete().eq('id', taskId);
    if (error) throw error;
  } catch (e) {
    throw toApiError(e, 'TASK_DELETE_FAILED');
  }
}

// ---------- Raw type from Supabase ----------
type RawTaskRow = {
  id: string;
  event_id?: string | null;
  name: string;
  description?: string | null;
  assignees?: string[] | null;
  due_date?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  start_time?: string | null;
  end_time?: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  sub_tasks?: RawSubTaskRow[] | null;
  attachments?: RawAttachmentRow[] | null;
  is_personal?: boolean | null;
  events?: { title: string } | null;
};

type RawAttachmentRow = {
  id: string;
  url: string;
  title?: string | null;
  favicon?: string | null;
};

type RawSubTaskRow = {
  id: string;
  name: string;
  completed?: boolean | null;
};

// ---------- Mappers ----------
function map(r: RawTaskRow): Task {
  return {
    id: String(r.id),
    name: r.name,
    eventId: r.event_id ?? undefined,
    eventTitle: r.events?.title ?? undefined,
    description: r.description ?? '',
    assignees: r.assignees ?? [],
    dueDate: r.due_date ?? '',
    startDate: r.start_date ?? '',
    endDate: r.end_date ?? '',
    startTime: r.start_time ?? '',
    endTime: r.end_time ?? '',
    status: r.status,
    priority: r.priority,
    subTasks: (r.sub_tasks ?? []).map(mapSubTask),
    attachments: (r.attachments ?? []).map(mapAttachment),
    isPersonal: Boolean(r.is_personal),
  };
}

function mapAttachment(a: RawAttachmentRow): Attachment {
  return {
    id: String(a.id),
    url: String(a.url),
    title: a.title ?? '',
    favicon: a.favicon ?? '',
  };
}

function mapSubTask(s: RawSubTaskRow): SubTask {
  return {
    id: String(s.id),
    name: s.name,
    completed: Boolean(s.completed),
  };
}

// ---------- Helpers ----------
function toRpcTaskPayload(task: Task): Record<string, unknown> {
  return {
    name: task.name,
    description: task.description,
    assignees: task.assignees,
    due_date: task.dueDate,
    start_date: task.startDate,
    end_date: task.endDate,
    start_time: task.startTime,
    end_time: task.endTime,
    status: task.status,
    priority: task.priority,
    is_personal: task.isPersonal ?? false,
    sub_tasks: task.subTasks ?? [],
    attachments: task.attachments ?? [],
  };
}