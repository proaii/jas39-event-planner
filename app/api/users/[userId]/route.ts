import { getUserById } from '@/lib/server/features/users/api';
import { jsonError } from '@/lib/errors';

export async function GET(_req: Request, context: { params: Promise<{ userId: string }> }) {
  try {
    const { userId } = await context.params;
    const user = await getUserById(userId);
    return Response.json(user);
  } catch (e) {
    return jsonError(e);
  }
}