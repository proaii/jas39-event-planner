import { createClient } from '@/lib/server/supabase/server';
import { toApiError } from '@/lib/errors';

export type Member = { id: string; event_id: string; user_id: string; role: string };

const TABLE = 'event_members';

export async function listMembers(eventId: string): Promise<Member[]> {
  const supabase = await createClient();
  try {
    const { data, error } = await supabase.from(TABLE).select('*').eq('event_id', eventId);
    if (error) throw error;
    return (data ?? []).map((r) => map(r));
  } catch (e) {
    throw toApiError(e, 'MEMBERS_LIST_FAILED');
  }
}

export async function inviteMember(eventId: string, userId: string, role: string): Promise<Member> {
  const supabase = await createClient();
  try {
    const { data, error } = await supabase
      .from(TABLE)
      .insert({ event_id: eventId, user_id: userId, role })
      .select('*')
      .single();
    if (error) throw error;
    return map(data);
  } catch (e) {
    throw toApiError(e, 'MEMBER_INVITE_FAILED');
  }
}

export async function removeMember(eventId: string, userId: string): Promise<void> {
  const supabase = await createClient();
  try {
    const { error } = await supabase.from(TABLE).delete().match({ event_id: eventId, user_id: userId });
    if (error) throw error;
  } catch (e) {
    throw toApiError(e, 'MEMBER_REMOVE_FAILED');
  }
}

function map(r: Record<string, unknown>): Member {
  return {
    id: String(r.id),
    event_id: String(r.event_id),
    user_id: String(r.user_id),
    role: String(r.role),
  };
}
