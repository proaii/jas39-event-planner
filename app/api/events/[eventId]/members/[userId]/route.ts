import { removeMember } from '@/lib/server/features/members/api';
import { jsonError } from '@/lib/errors';

export async function DELETE(
  _req: Request,
  context: { params: Promise<{ eventId: string; userId: string }> }
) {
  try {
    const { eventId, userId } = await context.params; 
    await removeMember(eventId, userId);
    return new Response(null, { status: 204 });
  } catch (e) {
    return jsonError(e);
  }
}
