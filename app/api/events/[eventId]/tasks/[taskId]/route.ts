import { deleteTask, updateTask } from '@/lib/server/features/tasks/api';
import { jsonError } from '@/lib/errors';

export async function PATCH(
  req: Request,
  context: { params: Promise<{ taskId: string }> } 
) {
  try {
    const { taskId } = await context.params; 
    const patch: Record<string, unknown> = await req.json(); 
    const updated = await updateTask(taskId, patch);
    return Response.json(updated);
  } catch (e) {
    return jsonError(e);
  }
}

export async function DELETE(
  _req: Request,
  context: { params: Promise<{ taskId: string }> }
) {
  try {
    const { taskId } = await context.params;
    await deleteTask(taskId);
    return new Response(null, { status: 204 });
  } catch (e) {
    return jsonError(e);
  }
}
