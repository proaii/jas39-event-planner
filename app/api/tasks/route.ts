import { listAllUserTasks, createPersonalTask } from '@/lib/server/features/tasks/api';
import { jsonError } from '@/lib/errors';
import type { TaskStatus } from '@/lib/types';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q') ?? undefined;

    const statusParam = searchParams.get('status');
    const validStatuses: TaskStatus[] = ['To Do', 'In Progress', 'Done'];
    const status = validStatuses.includes(statusParam as TaskStatus)
      ? (statusParam as TaskStatus)
      : undefined;

    const page = searchParams.get('page') ? Number(searchParams.get('page')) : undefined;
    const pageSize = searchParams.get('pageSize') ? Number(searchParams.get('pageSize')) : 100;

    const res = await listAllUserTasks({ q, status, page, pageSize });
    return Response.json(res);
  } catch (e) {
    return jsonError(e);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const created = await createPersonalTask(body);
    return Response.json(created, { status: 201 });
  } catch (e) {
    return jsonError(e);
  }
}
