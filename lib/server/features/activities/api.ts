import { createDb } from '@/lib/server/supabase/server';
import { toApiError } from '@/lib/errors';

export type ActivityItem = {
  id: string;
  user: string;
  userAvatar?: string | null;
  action: string;
  item: string;
  time: string; // ISO String
  type: 'event' | 'task' | 'member';
};

export async function useFetchRecentActivity(): Promise<ActivityItem[]> {
  const db = await createDb();

  try {
    // Get the latest Events (who created the Event)
    const { data: events } = await db
      .from('events')
      .select(`
        event_id, title, created_at,
        owner:users!events_owner_id_fkey(username, avatar_url)
      `)
      .order('created_at', { ascending: false })
      .limit(5);

    // Get the latest Tasks (newly created tasks)
    const { data: tasks } = await db
      .from('tasks')
      .select(`
        task_id, title, created_at,
        event:events!tasks_event_id_fkey(title, owner:users!events_owner_id_fkey(username, avatar_url))
      `)
      .order('created_at', { ascending: false })
      .limit(5);

    // Pull the latest members (who joined the event)
    const { data: members } = await db
      .from('event_members')
      .select(`
        event_member_id, joined_at,
        user:users!event_members_user_id_fkey(username, avatar_url),
        event:events!event_members_event_id_fkey(title)
      `)
      .order('joined_at', { ascending: false })
      .limit(5);

    // Normalize the data to the same format.
    const activities: ActivityItem[] = [];

    // Map Events
    events?.forEach((e: any) => {
      activities.push({
        id: e.event_id,
        user: e.owner?.username || 'Unknown',
        userAvatar: e.owner?.avatar_url,
        action: 'created event',
        item: e.title,
        time: e.created_at,
        type: 'event',
      });
    });

    // Map Tasks
    tasks?.forEach((t: any) => {
      activities.push({
        id: t.task_id,
        user: t.event?.owner?.username || 'System', // Since Table Tasks doesn't keep track of who created it, assume it's named Event Owner or 'System'.
        userAvatar: t.event?.owner?.avatar_url,
        action: 'added task',
        item: `${t.title} (in ${t.event?.title})`,
        time: t.created_at,
        type: 'task',
      });
    });

    // Map Members
    members?.forEach((m: any) => {
      activities.push({
        id: m.event_member_id,
        user: m.user?.username || 'Unknown',
        userAvatar: m.user?.avatar_url,
        action: 'joined event',
        item: m.event?.title,
        time: m.joined_at,
        type: 'member',
      });
    });

    // Combined and sorted by latest time
    return activities
      .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
      .slice(0, 5);

  } catch (e) {
    throw toApiError(e, 'FETCH_ACTIVITY_FAILED');
  }
}