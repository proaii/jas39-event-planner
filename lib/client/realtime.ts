// lib/realtime.ts
import { RealtimeChannel } from "@supabase/supabase-js";
import { supabaseClient } from "@/lib/server/supabase/client";

export type RealtimeCallback = (payload: any) => void;

export function subscribeToTable(
  table: string,
  callback: RealtimeCallback
): RealtimeChannel {
  const channel = supabaseClient
    .channel(`public:${table}`)
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table },
      payload => callback(payload)
    )
    .subscribe();

  return channel;
}

export function unsubscribeChannel(channel: RealtimeChannel) {
  try {
    channel.unsubscribe?.();
    supabaseClient.removeChannel?.(channel);
  } catch (err) {
    console.warn("Failed to unsubscribe:", err);
  }
}
