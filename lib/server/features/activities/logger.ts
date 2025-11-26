import { createDb } from '@/lib/server/supabase/server'; 

// Helper function: Record activities to the database via RPC.
export async function logActivity(
  userId: string,
  eventId: string | null,
  actionType: 'CREATE_TASK' | 'UPDATE_TASK' | 'DELETE_TASK' | 
    'CREATE_SUBTASK' | 'UPDATE_SUBTASK' | 'DELETE_SUBTASK' |
    'CREATE_EVENT' | 'JOIN_EVENT' | 'UPDATE_EVENT',
  entityType: 'TASK' | 'EVENT' | 'MEMBER' | 'SUBTASK',
  entityTitle: string,
  metadata?: Record<string, unknown>
) {
  
  const db = await createDb(); 
  
  try {
    const { error } = await db.rpc('log_activity_rpc', {
      user_id_in: userId,
      event_id_in: eventId,
      action_type_in: actionType,
      entity_type_in: entityType,
      entity_title_in: entityTitle,
      metadata_in: metadata || null,
    });
    
    if (error) throw error;
    
  } catch (error) {
    console.error('Failed to log activity via RPC:', error);
    // Do not throw errors to avoid affecting the main flow.
  }
}