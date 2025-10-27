import { updateTask, deleteTask } from '@/lib/server/features/tasks/api';
import { jsonError } from '@/lib/errors';

export async function PATCH(req: Request, context: { params: Promise<{ taskId: string }> }) {
  const { taskId } = await context.params;
  try {
    const patch = await req.json();
    const updated = await updateTask(taskId, patch);
    return Response.json(updated);
  } catch (e) {
    return jsonError(e);
  }
}

export async function DELETE(_: Request, context: { params: Promise<{ taskId: string }> }) {
  const { taskId } = await context.params;
  try {
    await deleteTask(taskId);
    return new Response(null, { status: 204 });
  } catch (e) {
    return jsonError(e);
  }
}
