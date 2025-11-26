import { getRecentActivities } from '@/lib/server/features/activities/api';
import { jsonError } from '@/lib/errors';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const activities = await getRecentActivities();
    return Response.json(activities);
  } catch (e) {
    return jsonError(e);
  }
}