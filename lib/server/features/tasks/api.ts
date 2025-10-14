import { createClient } from '@/lib/server/supabase/server';
import { toApiError } from '@/lib/errors';
import type { Task, SubTask, Attachment } from '@/lib/types';

const TABLE = 'tasks';

export async function listTasks(params: {
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
      .select('*', { count: 'exact' })
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

export async function createTask(eventId: string, input: Omit<Task, 'id' | 'eventTitle'>): Promise<Task> {
  const supabase = await createClient();
  try {
    const row = {
      event_id: eventId,
      name: input.name,
      description: input.description ?? null,
      assignees: input.assignees ?? [],
      due_date: input.dueDate ?? null,
      start_date: input.startDate ?? null,
      end_date: input.endDate ?? null,
      start_time: input.startTime ?? null,
      end_time: input.endTime ?? null,
      status: input.status,
      priority: input.priority,
      sub_tasks: input.subTasks ?? [],
      attachments: input.attachments ?? [],
      is_personal: input.isPersonal ?? null,
    };

    const { data, error } = await supabase.from(TABLE).insert(row).select('*').single();
    if (error) throw error;
    return map(data);
  } catch (e) {
    throw toApiError(e, 'TASK_CREATE_FAILED');
  }
}

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
    if (patch.subTasks !== undefined) row.sub_tasks = patch.subTasks;
    if (patch.attachments !== undefined) row.attachments = patch.attachments;
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

function map(r: Record<string, unknown>): Task {
  return {
    id: String(r.id),
    name: String(r.name),
    description: typeof r.description === 'string' ? r.description : undefined,
    assignees: Array.isArray(r.assignees) ? (r.assignees as string[]) : undefined,
    dueDate: typeof r.due_date === 'string' ? r.due_date : undefined,
    startDate: typeof r.start_date === 'string' ? r.start_date : undefined,
    endDate: typeof r.end_date === 'string' ? r.end_date : undefined,
    startTime: typeof r.start_time === 'string' ? r.start_time : undefined,
    endTime: typeof r.end_time === 'string' ? r.end_time : undefined,
    status: r.status as Task['status'],
    priority: r.priority as Task['priority'],
    subTasks: Array.isArray(r.sub_tasks) ? (r.sub_tasks as SubTask[]) : undefined,
    attachments: Array.isArray(r.attachments) ? (r.attachments as Attachment[]) : undefined,
    isPersonal: typeof r.is_personal === 'boolean' ? r.is_personal : undefined,
    eventTitle: typeof r.event_title === 'string' ? r.event_title : undefined,
  };
}