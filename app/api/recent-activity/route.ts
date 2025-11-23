import { useFetchRecentActivity } from '@/lib/server/features/activities/api';
import { jsonError } from '@/lib/errors';

export async function GET() {
  try {
    const activities = await useFetchRecentActivity();
    return Response.json(activities);
  } catch (e) {
    return jsonError(e);
  }
}