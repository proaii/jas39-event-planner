import { createClient as createAdminClient } from '@supabase/supabase-js';

// Function for recording Log
export async function logActivity(
  userId: string,
  actionType: 'CREATE_TASK' | 'UPDATE_TASK' | 'DELETE_TASK' | 'CREATE_EVENT' | 'JOIN_EVENT',
  entityType: 'TASK' | 'EVENT',
  entityTitle: string,
  metadata?: any
) {
  // Use Admin Client to be sure to write Log without RLS.
  const adminDb = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );

  try {
    await adminDb.from('activity_logs').insert({
      user_id: userId,
      action_type: actionType,
      entity_type: entityType,
      entity_title: entityTitle,
      metadata: metadata
    });
  } catch (error) {
    console.error('Failed to log activity:', error);
    // Do not throw errors to prevent main operation (Fire & Forget)
  }
}