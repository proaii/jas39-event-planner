import { inviteMember, listMembers } from '@/lib/server/features/members/api';
import { jsonError } from '@/lib/errors';

export async function GET(
  _req: Request,
  context: { params: Promise<{ eventId: string }> } 
) {
  try {
    const { eventId } = await context.params; 
    const data = await listMembers(eventId);
    return Response.json(data);
  } catch (e) {
    return jsonError(e);
  }
}

export async function POST(
  req: Request,
  context: { params: Promise<{ eventId: string }> }
) {
  try {
    const { eventId } = await context.params; 
    const { userId, role } = await req.json();
    const created = await inviteMember(eventId, userId, role);
    return Response.json(created, { status: 201 });
  } catch (e) {
    return jsonError(e);
  }
}
