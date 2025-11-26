// lib/realtime.ts
import { supabaseClient } from '@/lib/client/supabase/client';

type RealtimeOptions<T = Record<string, unknown>> = {
  eventId?: string;
  onChange?: (payload: {
    eventType: 'INSERT' | 'UPDATE' | 'DELETE';
    new: T | null;
    old: T | null;
  }) => void;
};

export function getRealtimeChannel<T = Record<string, unknown>>(
  tableName: string, 
  options: RealtimeOptions<T> = {}
) {
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
          eventType: payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE',
          new: (payload.new ?? null) as T | null,
          old: (payload.old ?? null) as T | null,
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