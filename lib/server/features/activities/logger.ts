import { createClient as createAdminClient } from '@supabase/supabase-js';

// Helper function: Record activities to the database.
export async function logActivity(
  userId: string,
  eventId: string | null, // null for Personal Task
  actionType: 'CREATE_TASK' | 'UPDATE_TASK' | 'DELETE_TASK' | 
              'CREATE_SUBTASK' | 'UPDATE_SUBTASK' | 'DELETE_SUBTASK' |
              'CREATE_EVENT' | 'JOIN_EVENT' | 'UPDATE_EVENT',
  entityType: 'TASK' | 'EVENT' | 'MEMBER' | 'SUBTASK',
  entityTitle: string,
  metadata?: Record<string, any>
) {
  // Use Admin Client to be sure when writing Log (to prevent RLS when writing)
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return;
  
  const adminDb = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );

  try {
    await adminDb.from('activity_logs').insert({
      user_id: userId,
      event_id: eventId,
      action_type: actionType,
      entity_type: entityType,
      entity_title: entityTitle,
      metadata: metadata
    });
  } catch (error) {
    console.error('Failed to log activity:', error);
    // Do not throw errors to avoid affecting the main flow.
  }
}