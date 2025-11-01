import { listEventMembers, addEventMember } from '@/lib/server/features/events/api';
import { jsonError } from '@/lib/errors';
import type { MembersRes } from '@/lib/types';

export async function GET(_req: Request, context: { params: Promise<{ eventId: string }> }) {
  try {
    const { eventId } = await context.params;
    const items = await listEventMembers(eventId);
    const res: MembersRes = { items };
    return Response.json(res);
  } catch (e) {
    return jsonError(e);
  }
}

export async function POST(req: Request, context: { params: Promise<{ eventId: string }> }) {
  try {
    const { eventId } = await context.params;
    const body = (await req.json()) as { userId?: string; memberId?: string };

    const userId = body.userId ?? body.memberId;
    if (!userId) throw new Error('MISSING_USER_ID');

    await addEventMember(eventId, userId);
    return Response.json({ ok: true }, { status: 201 });
  } catch (e) {
    return jsonError(e);
  }
}
