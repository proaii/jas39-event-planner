import { createClient, createDb } from '@/lib/server/supabase/server';
import { toApiError } from '@/lib/errors';
import type { EventMember } from '@/lib/types';

// ---------- Event Members ----------

export async function listEventMembers(eventId: string): Promise<EventMember[]> {
  const db = await createDb();
  const { data, error } = await db
    .from('event_members')
    .select('event_member_id, event_id, user_id, joined_at')
    .eq('event_id', eventId)
    .order('joined_at', { ascending: true });

  if (error) throw toApiError(error, 'EVENT_MEMBERS_LIST_FAILED');

  return (data ?? []).map(r => ({
    eventMemberId: String(r.event_member_id),
    eventId: String(r.event_id),
    userId: String(r.user_id),
    joinedAt: String(r.joined_at),
  }));
}

export async function addEventMember(eventId: string, userId: string): Promise<void> {
  const root = await createClient();
  const db = await createDb();
  try {
    // Only the owner can add members
    const { data: ev, error: e1 } = await db
      .from('events')
      .select('owner_id')
      .eq('event_id', eventId)
      .single();
    if (e1) throw e1;

    const { data: { user }, error: uerr } = await root.auth.getUser();
    if (uerr) throw uerr;
    if (!user) throw new Error('UNAUTHORIZED');
    if (ev?.owner_id !== user.id) throw new Error('FORBIDDEN');

    const { error } = await db
      .from('event_members')
      .upsert(
        { event_id: eventId, user_id: userId, joined_at: new Date().toISOString() },
        { onConflict: 'event_id,user_id', ignoreDuplicates: true }
      );
    if (error) throw error;
  } catch (e) {
    throw toApiError(e, 'EVENT_MEMBER_ADD_FAILED');
  }
}

export async function removeEventMember(eventId: string, userId: string): Promise<void> {
  const root = await createClient();
  const db = await createDb();
  try {
    // Only the owner can remove members
    const { data: ev, error: e1 } = await db
      .from('events')
      .select('owner_id')
      .eq('event_id', eventId)
      .single();
    if (e1) throw e1;

    const { data: { user }, error: uerr } = await root.auth.getUser();
    if (uerr) throw uerr;
    if (!user) throw new Error('UNAUTHORIZED');
    if (ev?.owner_id !== user.id) throw new Error('FORBIDDEN');

    const { error } = await db
      .from('event_members')
      .delete()
      .eq('event_id', eventId)
      .eq('user_id', userId);
    if (error) throw error;
  } catch (e) {
    throw toApiError(e, 'EVENT_MEMBER_REMOVE_FAILED');
  }
}