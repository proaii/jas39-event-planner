import { createSubtask } from '@/lib/server/features/tasks/api';
import { jsonError } from '@/lib/errors';

export async function POST(
  req: Request,
  context: { params: Promise<{ taskId: string }> }
) {
  try {
    const { taskId } = await context.params;
    const body = await req.json();

    const newSubtask = await createSubtask(taskId, body.title, body.status);

    return Response.json(newSubtask, { status: 201 });
  } catch (e) {
    return jsonError(e);
  }
}