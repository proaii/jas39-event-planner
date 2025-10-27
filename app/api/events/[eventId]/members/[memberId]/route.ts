import { removeEventMember } from '@/lib/server/features/events/api';
import { jsonError } from '@/lib/errors';

export async function DELETE(_req: Request, context: { params: Promise<{ eventId: string; memberId: string }> }) {
  try {
    const { eventId, memberId } = await context.params; 
    await removeEventMember(eventId, memberId);
    return Response.json({ ok: true });
  } catch (e) {
    return jsonError(e);
  }
}