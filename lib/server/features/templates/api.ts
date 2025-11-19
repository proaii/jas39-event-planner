import { createClient, createDb } from '@/lib/server/supabase/server';
import { toApiError } from '@/lib/errors';
import type { EventTemplate } from '@/lib/types';
import type { TemplateData } from '@/schemas/template';

// ---------- Event Templates ----------

// List all Event Templates owned by the current user.
export async function listEventTemplates(): Promise<EventTemplate[]> {
  const root = await createClient();
  const db = await createDb();

  try {
    const { data: { user }, error: uerr } = await root.auth.getUser();
    if (uerr) throw uerr;
    if (!user) throw new Error('UNAUTHORIZED');
    
    const { data, error } = await db
      .from('event_templates')
      .select('template_id, owner_id, name, description, created_at, event_data')
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data ?? []).map(mapTemplate);

  } catch (e) {
    throw toApiError(e, 'TEMPLATE_LIST_FAILED');
  }
}

export async function saveEventAsTemplate(eventId: string, input: TemplateData): Promise<EventTemplate> {
  const root = await createClient();
  const db = await createDb();

  try {
    const { data: { user }, error: uerr } = await root.auth.getUser();
    if (uerr) throw uerr;
    if (!user) throw new Error('UNAUTHORIZED');

const { data: event, error: eventError } = await db
      .from('events')
      .select('owner_id')
      .eq('event_id', eventId)
      .single();

    if (eventError) throw eventError;
    if (!event) throw new Error('NOT_FOUND'); 

    const isOwner = event.owner_id === user.id;

    let isMember = false;
    if (!isOwner) {
      const { data: member, error: memberError } = await db
        .from('event_members')
        .select('user_id')
        .eq('event_id', eventId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (memberError) throw memberError;
      isMember = !!member; 
    }

    if (!isOwner && !isMember) {
      throw new Error('FORBIDDEN'); 
    }

    const { name, description, ...eventData } = input;

    const { data, error } = await db
      .from('event_templates')
      .insert({
        owner_id: user.id,
        name: name,
        description: description,
        event_data: eventData, 
      })
      .select('template_id, owner_id, name, description, created_at, event_data')
      .single();

    if (error) throw error;
    
    return mapTemplate(data as RawTemplateRow);

  } catch (e) {
    throw toApiError(e, 'TEMPLATE_SAVE_FAILED');
  }
}

// ---------- Template Types & Mapper ----------
type EventData = {
  title?: string;
  location?: string | null;
  eventDescription?: string | null;
  coverImageUri?: string | null;
  color?: number;
  members?: { userId: string }[];
  startAt?: string | null;
  endAt?: string | null;
};

type RawTemplateRow = {
  template_id: string;
  owner_id: string;
  name: string;
  description?: string | null;
  created_at: string;
  event_data: EventData; 
};

function mapTemplate(r: RawTemplateRow): EventTemplate {
  return {
    templateId: String(r.template_id),
    ownerId: String(r.owner_id),
    name: String(r.name),
    description: r.description ?? '',
    createdAt: String(r.created_at),
    eventData: {
      title: r.event_data.title ?? '',
      location: r.event_data.location,
      eventDescription: r.event_data.eventDescription,
      coverImageUri: r.event_data.coverImageUri,
      color: Number(r.event_data.color ?? 0),
      members: Array.isArray(r.event_data.members) ? r.event_data.members.map(m => m.userId) : [],
      startAt: r.event_data.startAt,
      endAt: r.event_data.endAt,
    },
  };
}