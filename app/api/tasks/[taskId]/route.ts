import { getTaskById, updateTask, deleteTask } from '@/lib/server/features/tasks/api';
import { jsonError } from '@/lib/errors';

export async function GET(req: Request, context: { params: Promise<{ taskId: string }> }) {
  const { taskId } = await context.params;

  try {
    const task = await getTaskById(taskId);
    return Response.json(task);
  } catch (e) {
    return jsonError(e);
  }
}

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

export async function DELETE(
  _: Request, 
  context: { params: Promise<{ taskId: string }> }
) {
  const { taskId } = await context.params;
  try {
    await deleteTask(taskId);

    return Response.json({ success: true, deletedId: taskId }); 
  } catch (e) {
    return jsonError(e);
  }
}