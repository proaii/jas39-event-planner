// lib/realtime.ts
import { supabaseClient } from '@/lib/client/supabase/client';

type RealtimeRow = Record<string, unknown>;

type RealtimeOptions = {
  eventId?: string;
  onChange?: (payload: {
    eventType: 'INSERT' | 'UPDATE' | 'DELETE';
    new: RealtimeRow | null;
    old: RealtimeRow | null;
  }) => void;
};

export function getRealtimeChannel(tableName: string, options: RealtimeOptions = {}) {
  const { eventId, onChange } = options;

  const channel = supabaseClient
    .channel(`channel_${tableName}`)
    .on(
      'postgres_changes',
      {
        event: '*',            // ฟังทั้ง INSERT / UPDATE / DELETE
        schema: 'public',
        table: tableName,
        // filter ตาม event_id เฉพาะ event เดียว
        ...(eventId ? { filter: `event_id=eq.${eventId}` } : {}),
      },
      (payload) => {
        console.log('[realtime]', tableName, payload);

        onChange?.({
          eventType: payload.eventType,
          new: (payload.new ?? null) as RealtimeRow | null,
          old: (payload.old ?? null) as RealtimeRow | null,
        });
      }
    )
    .subscribe((status) => {
      console.log(`[realtime] channel_${tableName} status:`, status);
    });

  // cleanup function
  return () => {
    console.log('[realtime] removing channel', `channel_${tableName}`);
    supabaseClient.removeChannel(channel);
  };
}
