import { updateSubtask, deleteSubtask } from '@/lib/server/features/tasks/api';
import { jsonError } from '@/lib/errors';

export async function PATCH(
  req: Request,
  context: { params: Promise<{ subtaskId: string }> }
) {
  try {
    const { subtaskId } = await context.params;
    const body = await req.json();

    const updated = await updateSubtask(subtaskId, body);

    return Response.json(updated);
  } catch (e) {
    return jsonError(e);
  }
}

export async function DELETE(
  req: Request,
  context: { params: Promise<{ subtaskId: string }> }
) {
  try {
    const { subtaskId } = await context.params;
    
    await deleteSubtask(subtaskId);

    return new Response(null, { status: 204 });
  } catch (e) {
    return jsonError(e);
  }
}