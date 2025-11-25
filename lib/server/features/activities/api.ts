import { createDb } from '@/lib/server/supabase/server';
import { createClient } from '@/lib/server/supabase/server';
import { toApiError } from '@/lib/errors';
import type { ActivityItem } from '@/lib/types';

interface ActivityLogRow {
  id: string;
  action_type: string;
  entity_title: string;
  created_at: string;
  user: {
    username: string;
    avatar_url: string | null;
  } | null;
}

export async function getEventActivities(eventId: string): Promise<ActivityItem[]> {
  const db = await createDb();

  try {
    const { data, error } = await db
      .from('activity_logs')
      .select(`
        id, action_type, entity_title, created_at,
        user:users!activity_logs_user_id_fkey(username, avatar_url)
      `)
      .eq('event_id', eventId)
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) throw error;

    const rows = (data || []) as unknown as ActivityLogRow[];

    return rows.map((row) => {
      let actionText = 'performed action'; 

      switch (row.action_type) {
        // Task
        case 'CREATE_TASK': actionText = 'created task'; break;
        case 'UPDATE_TASK': actionText = 'updated task'; break;
        case 'DELETE_TASK': actionText = 'deleted task'; break;
        
        // Event / Member
        case 'JOIN_EVENT': actionText = 'joined event'; break;
        case 'CREATE_EVENT': actionText = 'created event'; break;
        case 'UPDATE_EVENT': actionText = 'updated event details'; break;
        
        // Subtask
        case 'CREATE_SUBTASK': actionText = 'added subtask'; break;
        case 'UPDATE_SUBTASK': actionText = 'updated subtask'; break;
        case 'DELETE_SUBTASK': actionText = 'deleted subtask'; break;
      }

      return {
        id: row.id,
        user: row.user?.username || 'Unknown',
        userAvatar: row.user?.avatar_url,
        action: actionText,
        item: row.entity_title,
        time: row.created_at,
      };
    });

  } catch (e) {
    throw toApiError(e, 'FETCH_ACTIVITY_FAILED');
  }
}

export async function getPersonalActivities(): Promise<ActivityItem[]> {
  const db = await createDb();
  const root = await createClient();

  try {
    const { data: { user }, error: uerr } = await root.auth.getUser();
    if (uerr || !user) throw new Error('UNAUTHORIZED');

    const { data, error } = await db
      .from('activity_logs')
      .select(`
        id, action_type, entity_title, created_at,
        user:users!activity_logs_user_id_fkey(username, avatar_url)
      `)
      .is('event_id', null)
      .eq('user_id', user.id) 
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) throw error;

    const rows = (data || []) as unknown as ActivityLogRow[];

    return rows.map((row) => {
      let actionText = 'performed action';

      switch (row.action_type) {
        case 'CREATE_TASK': actionText = 'created personal task'; break;
        case 'UPDATE_TASK': actionText = 'updated personal task'; break;
        case 'DELETE_TASK': actionText = 'deleted personal task'; break;
        case 'CREATE_SUBTASK': actionText = 'added subtask to personal task'; break;
        case 'UPDATE_SUBTASK': actionText = 'updated subtask'; break;
        case 'DELETE_SUBTASK': actionText = 'deleted subtask'; break;
      }

      return {
        id: row.id,
        user: row.user?.username || 'Unknown',
        userAvatar: row.user?.avatar_url,
        action: actionText,
        item: row.entity_title,
        time: row.created_at,
      };
    });

  } catch (e) {
    throw toApiError(e, 'FETCH_PERSONAL_ACTIVITY_FAILED');
  }
}