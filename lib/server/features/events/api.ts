import { createClient } from '@/lib/server/supabase/server';
import { toApiError } from '@/lib/errors';
import type { Event } from '@/lib/types';

const TABLE = 'events';

export async function listEvents(params: {
  ownerId?: string; q?: string; page?: number; pageSize?: number;
}): Promise<{ items: Event[]; nextPage: number|null }> {
  const supabase = await createClient();
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 10;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  try {
    // If the caller doesn't send the ownerId, use your own (from the session)
    let ownerId = params.ownerId;
    if (!ownerId) {
      const { data: { user }, error: uerr } = await supabase.auth.getUser();
      if (uerr) throw uerr;
      ownerId = user?.id ?? undefined;
    }

    // NOTE: If the table doesn't have created_at , change it to 'date'.
    let q = supabase
      .from(TABLE)
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (ownerId) q = q.eq('owner_id', ownerId);
    if (params.q) q = q.ilike('title', `%${params.q}%`);

    const { data, error, count } = await q.range(from, to);
    if (error) throw error;

    const items = (data ?? []).map(map);
    const total = count ?? 0;
    const maxPage = Math.max(1, Math.ceil(total / pageSize));
    return { items, nextPage: page < maxPage ? page + 1 : null };
  } catch (e) {
    throw toApiError(e, 'EVENTS_LIST_FAILED');
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
    const { data, error } = await supabase.from(TABLE).select('*').eq('id', id).single();
    if (error) throw error;
    return map(data);
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

function map(r: Record<string, unknown>): Event {
  return {
    id: String(r.id),
    title: String(r.title),
    date: String(r.date),
    endDate: r.end_date ? String(r.end_date) : '',
    time: String(r.time),
    endTime: r.end_time ? String(r.end_time) : '',
    isMultiDay: Boolean(r.is_multi_day),
    location: String(r.location),
    description: r.description ? String(r.description) : '', 
    progress: typeof r.progress === 'number' ? r.progress : 0,
    tasks: [],
    members: [],
    coverImage: r.cover_image ? String(r.cover_image) : '',
    color: r.color ? String(r.color) : '',
  };
}