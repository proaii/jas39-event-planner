import { createClient } from '@/lib/server/supabase/server';
import { toApiError } from '@/lib/errors';
import type { Event, EventMember } from '@/lib/types';

const TABLE = 'events';

// List all Events which the user is associated with
export async function listAllEvents(params: {
  q?: string;
  page?: number;
  pageSize?: number;
}): Promise<{ items: Event[]; nextPage: number | null }> {
  const supabase = await createClient();
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 10;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  try {
    const { data: { user }, error: uerr } = await supabase.auth.getUser();
    if (uerr) throw uerr;
    if (!user) throw new Error('UNAUTHORIZED');

    const { data: mrows, error: merr } = await supabase
      .from('event_members')
      .select('event_id')
      .eq('member_id', user.id);
    if (merr) throw merr;
    const memberEventIds = (mrows ?? []).map(r => String(r.event_id));

    const { data: orows, error: oerr } = await supabase
      .from(TABLE)
      .select('id')
      .eq('owner_id', user.id);
    if (oerr) throw oerr;
    const ownerEventIds = (orows ?? []).map(r => String(r.id));

    const ids = Array.from(new Set([...memberEventIds, ...ownerEventIds]));

    if (ids.length === 0) {
      return { items: [], nextPage: null };
    }

    let q = supabase
      .from(TABLE)
      .select(`
        *,
        event_members!left ( member_id )
      `, { count: 'exact' })
      .in('id', ids)
      .order('created_at', { ascending: false });

    if (params.q) q = q.ilike('title', `%${params.q}%`);

    const { data, error, count } = await q.range(from, to);
    if (error) throw error;

    const items = (data ?? []).map(map);
    const total = count ?? 0;
    const maxPage = Math.max(1, Math.ceil(total / pageSize));
    return { items, nextPage: page < maxPage ? page + 1 : null };
  } catch (e) {
    throw toApiError(e, 'ALL_EVENTS_LIST_FAILED');
  }
}

export async function createEvent(input: Omit<Event, 'id'|'tasks'|'members'>): Promise<Event> {
  const supabase = await createClient();
  try {
    const { data: { user }, error: uerr } = await supabase.auth.getUser();
    if (uerr) throw uerr;
    if (!user) throw new Error('UNAUTHORIZED');

    const row = {
      owner_id: user.id,                 
      title: input.title,
      date: input.date,
      end_date: input.endDate ?? null,
      time: input.time,
      end_time: input.endTime ?? null,
      is_multi_day: input.isMultiDay ?? false,
      location: input.location,
      description: input.description,
      progress: input.progress ?? 0,
      cover_image: input.coverImage ?? null,
      color: input.color ?? null,
    };

    const { data, error } = await supabase.from(TABLE).insert(row).select('*').single();
    if (error) throw error;
    return map(data);
  } catch (e) {
    throw toApiError(e, 'EVENT_CREATE_FAILED');
  }
}

export async function getEvent(id: string): Promise<Event> {
  const supabase = await createClient();
  try {
    const { data, error } = await supabase
      .from(TABLE)
      .select(`
        *,
        event_members!left ( member_id )
      `)
      .eq('id', id)
      .single();
    if (error) throw error;
    return map(data as RawEventRow);
  } catch (e) {
    throw toApiError(e, 'EVENT_GET_FAILED');
  }
}

export async function updateEvent(id: string, patch: Partial<Event>): Promise<Event> {
  const supabase = await createClient();
  try {
    const { data: { user }, error: uerr } = await supabase.auth.getUser();
    if (uerr) throw uerr;
    if (!user) throw new Error('UNAUTHORIZED');

    const row: Record<string, unknown> = {};
    if (patch.title !== undefined) row.title = patch.title;
    if (patch.date !== undefined) row.date = patch.date;
    if (patch.endDate !== undefined) row.end_date = patch.endDate;
    if (patch.time !== undefined) row.time = patch.time;
    if (patch.endTime !== undefined) row.end_time = patch.endTime;
    if (patch.isMultiDay !== undefined) row.is_multi_day = patch.isMultiDay;
    if (patch.location !== undefined) row.location = patch.location;
    if (patch.description !== undefined) row.description = patch.description;
    if (patch.progress !== undefined) row.progress = patch.progress;
    if (patch.coverImage !== undefined) row.cover_image = patch.coverImage;
    if (patch.color !== undefined) row.color = patch.color;

    const { data, error } = await supabase
      .from(TABLE)
      .update(row)
      .eq('id', id)
      .eq('owner_id', user.id)
      .select('*')
      .single();

    if (error) throw error;
    return map(data);
  } catch (e) {
    throw toApiError(e, 'EVENT_UPDATE_FAILED');
  }
}

export async function deleteEvent(id: string): Promise<void> {
  const supabase = await createClient();
  try {
    const { data: { user }, error: uerr } = await supabase.auth.getUser();
    if (uerr) throw uerr;
    if (!user) throw new Error('UNAUTHORIZED');

    const { error } = await supabase.from(TABLE).delete().eq('id', id).eq('owner_id', user.id); 
    if (error) throw error;
  } catch (e) {
    throw toApiError(e, 'EVENT_DELETE_FAILED');
  }
}

export async function listEventMembers(eventId: string): Promise<EventMember[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('event_members')
    .select('id, event_id, member_id, role, joined_at') 
    .eq('event_id', eventId)
    .order('joined_at', { ascending: true });

  if (error) throw toApiError(error, 'EVENT_MEMBERS_LIST_FAILED');

  return (data ?? []).map(r => ({
    id: String(r.id),
    eventId: String(r.event_id),
    memberId: String(r.member_id),
    role: String(r.role ?? 'member'),
    joinedAt: String(r.joined_at ?? ''),
  }));
}

export async function addEventMember(eventId: string, memberId: string, role: string = 'member'): Promise<void> {
  const supabase = await createClient();
  try {
    // Allow only the owner of the event
    const { data: ev, error: e1 } = await supabase
      .from('events')
      .select('owner_id')
      .eq('id', eventId)
      .single();
    if (e1) throw e1;

    const { data: { user }, error: uerr } = await supabase.auth.getUser();
    if (uerr) throw uerr;
    if (!user) throw new Error('UNAUTHORIZED');
    if (ev?.owner_id !== user.id) throw new Error('FORBIDDEN');

    const { error } = await supabase
      .from('event_members')
      .upsert(
        { event_id: eventId, member_id: memberId, role },
        { onConflict: 'event_id,member_id', ignoreDuplicates: true }
      );
    if (error) throw error;
  } catch (e) {
    throw toApiError(e, 'EVENT_MEMBER_ADD_FAILED');
  }
}

export async function removeEventMember(eventId: string, memberId: string): Promise<void> {
  const supabase = await createClient();
  try {
    // Only allow the owner to delete members
    const { data: ev, error: e1 } = await supabase
      .from('events')
      .select('owner_id')
      .eq('id', eventId)
      .single();
    if (e1) throw e1;

    const { data: { user }, error: uerr } = await supabase.auth.getUser();
    if (uerr) throw uerr;
    if (!user) throw new Error('UNAUTHORIZED');
    if (ev?.owner_id !== user.id) throw new Error('FORBIDDEN');

    const { error } = await supabase
      .from('event_members')
      .delete()
      .eq('event_id', eventId)
      .eq('member_id', memberId);
    if (error) throw error;
  } catch (e) {
    throw toApiError(e, 'EVENT_MEMBER_REMOVE_FAILED');
  }
}

type RawEventRow = {
  id: string;
  owner_id: string;
  title: string;
  date: string;
  end_date?: string | null;
  time: string;
  end_time?: string | null;
  is_multi_day?: boolean | null;
  location: string;
  description?: string | null;
  progress?: number | null;
  cover_image?: string | null;
  color?: string | null;
  event_members?: { member_id: string }[] | null;
};

// ---------- Mappers ----------
function map(r: RawEventRow): Event {
  const members = Array.isArray(r.event_members)
    ? Array.from(new Set(r.event_members.map(m => String(m.member_id))))
    : [];

  return {
    id: String(r.id),
    ownerId: String(r.owner_id),
    title: String(r.title),
    date: String(r.date),
    endDate: r.end_date ?? '',
    time: String(r.time),
    endTime: r.end_time ?? '',
    isMultiDay: Boolean(r.is_multi_day),
    location: String(r.location),
    description: r.description ?? '',
    progress: typeof r.progress === 'number' ? r.progress : 0,
    tasks: [],
    members,            
    coverImage: r.cover_image ?? '',
    color: r.color ?? '',
  };
}
