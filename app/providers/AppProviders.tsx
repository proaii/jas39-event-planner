'use client';

import { ThemeProvider } from 'next-themes';
import { ReactQueryProvider } from './ReactQueryProvider';
import { AuthProvider } from './AuthProvider';
import { Session } from '@supabase/supabase-js';
import { createClient } from '@/lib/server/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

export function AppProviders({
  children,
  initialSession,
}: {
  children: React.ReactNode;
  initialSession?: Session | null;
}) {
  const supabase = createClient();

  return (
    <ReactQueryProvider>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <AuthProvider initialSession={initialSession || null}>
          <RealtimeProvider supabase={supabase}>{children}</RealtimeProvider>
        </AuthProvider>
      </ThemeProvider>
    </ReactQueryProvider>
  );
}


// ------------------- Realtime Provider -------------------
function RealtimeProvider({
  supabase,
  children,
}: {
  supabase: ReturnType<typeof createClient>;
  children: React.ReactNode;
}) {
  const queryClient = useQueryClient();

  useEffect(() => {
    // subscribe events table
    const channel = supabase
      .channel('events-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'events' },
        (payload) => {
          console.log('Realtime event:', payload);
          // invalidate events query → cache sync
          queryClient.invalidateQueries({ queryKey: ['events'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, queryClient]);

  return <>{children}</>;
}