import { createClient, createDb } from '@/lib/server/supabase/server';
import { toApiError } from '@/lib/errors';
import type { Event } from '@/lib/types';
import { logActivity } from '@/lib/server/features/activities/logger';

const TABLE = 'events';

// ---------- Events ----------

// List all Events which the user is associated with (owner or member)
export async function listAllEvents(params: {
  q?: string;
  page?: number;
  pageSize?: number;
}): Promise<{ items: Event[]; nextPage: number | null }> {
  const root = await createClient();
  const db = await createDb();

  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 10;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  try {
    const { data: { user }, error: uerr } = await root.auth.getUser();
    if (uerr) throw uerr;
    if (!user) throw new Error('UNAUTHORIZED');

    // events where I'm a member
    const { data: mrows, error: merr } = await db
      .from('event_members')
      .select('event_id')
      .eq('user_id', user.id);
    if (merr) throw merr;
    const memberEventIds = (mrows ?? []).map(r => String(r.event_id));

    // events where I'm the owner
    const { data: orows, error: oerr } = await db
      .from(TABLE)
      .select('event_id')
      .eq('owner_id', user.id);
    if (oerr) throw oerr;
    const ownerEventIds = (orows ?? []).map(r => String(r.event_id));

    const ids = Array.from(new Set([...memberEventIds, ...ownerEventIds]));
    if (ids.length === 0) return { items: [], nextPage: null };

    let q = db
      .from(TABLE)
      .select(`
        event_id, owner_id, title, location, description, cover_image_uri, color, created_at, start_at, end_at,
        event_members ( user_id )
      `, { count: 'exact' })
      .in('event_id', ids)
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

export async function getEvent(eventId: string): Promise<Event> {
  const db = await createDb();
  try {
    const { data, error } = await db
      .from(TABLE)
      .select(`
        event_id, owner_id, title, location, description, cover_image_uri,
        color, created_at, start_at, end_at,
        event_members ( user_id )
      `)
      .eq('event_id', eventId)
      .single();
    if (error) throw error;
    console.log(data);
    return map(data as RawEventRow);
  } catch (e) {
    throw toApiError(e, 'EVENT_GET_FAILED');
  }
}

export async function createEvent(input: Omit<Event, 'eventId' | 'ownerId' | 'createdAt'>): Promise<Event> {
  const root = await createClient();
  const db = await createDb();
  try {
    const { data: { user }, error: uerr } = await root.auth.getUser();
    if (uerr) throw uerr;
    if (!user) throw new Error('UNAUTHORIZED');

    const row = {
      owner_id: user.id,
      title: input.title,
      location: input.location ?? null,
      description: input.description ?? null,
      cover_image_uri: input.coverImageUri ?? null,
      color: typeof input.color === 'number' ? input.color : 0,
      start_at: input.startAt ?? null,
      end_at: input.endAt ?? null,
    };

    const { data, error } = await db
      .from(TABLE)
      .insert(row)
      .select(`
        event_id, owner_id, title, location, description, cover_image_uri, color, created_at, start_at, end_at
      `)
      .single();
    if (error) throw error;

    const eventData = map(data as RawEventRow);

    // Add owner and other members to the event
    const memberIds = new Set(input.members ? [...input.members, user.id] : [user.id]);
    const membersToInsert = Array.from(memberIds).map((userId) => ({
      event_id: eventData.eventId,
      user_id: userId,
      joined_at: new Date().toISOString(),
    }));

    if (membersToInsert.length > 0) {
      const { error: memberErr } = await db
        .from("event_members")
        .insert(membersToInsert);

      if (memberErr) {
        console.error("Failed to insert event members", memberErr);
        throw memberErr;
      }
    }

    // Log Activity
    await logActivity(
      user.id,
      eventData.eventId,
      'CREATE_EVENT',
      'EVENT',
      eventData.title
    );

    return eventData;
  } catch (e) {
    console.log(e);
    throw toApiError(e, 'EVENT_CREATE_FAILED');
  }
}

export async function updateEvent(eventId: string, patch: Partial<Event>): Promise<Event> {
  const root = await createClient();
  const db = await createDb();
  try {
    const { data: { user }, error: uerr } = await root.auth.getUser();
    if (uerr) throw uerr;
    if (!user) throw new Error('UNAUTHORIZED');

    const row: Record<string, unknown> = {};
    if (patch.title !== undefined) row.title = patch.title;
    if (patch.location !== undefined) row.location = patch.location;
    if (patch.description !== undefined) row.description = patch.description;
    if (patch.coverImageUri !== undefined) row.cover_image_uri = patch.coverImageUri;
    if (patch.color !== undefined) row.color = patch.color;
    if (patch.startAt !== undefined) row.start_at = patch.startAt;
    if (patch.endAt !== undefined) row.end_at = patch.endAt;

    const { data, error } = await db
      .from(TABLE)
      .update(row)
      .eq('event_id', eventId)
      .eq('owner_id', user.id)
      .select(`
        event_id, owner_id, title, location, description, cover_image_uri, color, created_at, start_at, end_at
      `)
      .single();

    if (error) throw error;
    const eventData = map(data as RawEventRow);

    // Log Activity
    await logActivity(
      user.id,
      eventId,
      'UPDATE_EVENT',
      'EVENT',
      eventData.title
    );

    return eventData;
  } catch (e) {
    throw toApiError(e, 'EVENT_UPDATE_FAILED');
  }
}

export async function deleteEvent(eventId: string): Promise<void> {
  const root = await createClient();
  const db = await createDb();
  try {
    const { data: { user }, error: uerr } = await root.auth.getUser();
    if (uerr) throw uerr;
    if (!user) throw new Error('UNAUTHORIZED');

    const { error } = await db.from(TABLE).delete().eq('event_id', eventId).eq('owner_id', user.id);
    if (error) throw error;
  } catch (e) {
    throw toApiError(e, 'EVENT_DELETE_FAILED');
  }
}

// ---------- Event Types & Mapper ----------

type RawEventRow = {
  event_id: string;
  owner_id: string;
  title: string;
  location?: string | null;
  description?: string | null;
  cover_image_uri?: string | null;
  color: number;
  created_at: string;
  start_at?: string | null;
  end_at?: string | null;
  event_members?: { user_id: string }[] | null;
};

function map(r: RawEventRow): Event {
  const members = Array.isArray(r.event_members)
    ? Array.from(new Set(r.event_members.map(m => String(m.user_id))))
    : [];

  return {
    eventId: String(r.event_id),
    ownerId: String(r.owner_id),
    title: String(r.title),
    location: r.location ?? '',
    description: r.description ?? '',
    coverImageUri: r.cover_image_uri ?? '',
    color: Number(r.color ?? 0),
    createdAt: String(r.created_at),
    startAt: r.start_at ?? null,
    endAt: r.end_at ?? null,
    members,
  };
}