import { getEventActivityById } from '@/lib/server/features/activities/api';
import { jsonError } from '@/lib/errors';

export const dynamic = 'force-dynamic'; 

export async function GET(req: Request, context: { params: Promise<{ eventId: string }> }) {
  try {
    const { eventId } = await context.params; 
    const activities = await getEventActivityById(eventId);
    
    return Response.json(activities);
  } catch (e) {
    return jsonError(e);
  }
}