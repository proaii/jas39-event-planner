import { getCurrentUser } from '@/lib/server/features/users/api';
import { jsonError } from '@/lib/errors';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const user = await getCurrentUser();
    return Response.json(user);
  } catch (e) {
    return jsonError(e);
  }
}
