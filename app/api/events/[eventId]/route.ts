import { deleteEvent, getEvent, updateEvent } from '@/lib/server/features/events/api';
import { jsonError } from '@/lib/errors';

export async function GET(_: Request, context: { params: Promise<{ eventId: string }> }) {
  const { eventId } = await context.params;
  try {
    if (!eventId) throw new Error('MISSING_EVENT_ID');
    const ev = await getEvent(eventId);
    return Response.json(ev);
  } catch (e) {
    return jsonError(e, 404);
  }
}

export async function PATCH(req: Request, context: { params: Promise<{ eventId: string }> }) {
  const { eventId } = await context.params;
  try {
    const patch = await req.json();
    const updated = await updateEvent(eventId, patch);
    return Response.json(updated);
  } catch (e) {
    return jsonError(e);
  }
}

export async function DELETE(_: Request, context: { params: Promise<{ eventId: string }> }) {
  const { eventId } = await context.params;
  try {
    await deleteEvent(eventId);
    return new Response(null, { status: 204 });
  } catch (e) {
    return jsonError(e);
  }
}