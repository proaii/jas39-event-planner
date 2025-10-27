'use client';

import { ThemeProvider } from 'next-themes';
import { ReactQueryProvider } from './ReactQueryProvider';
import { AuthProvider } from './AuthProvider';
import { Session } from '@supabase/supabase-js';

export function AppProviders({
  children,
  initialSession,
}: {
  children: React.ReactNode;
  initialSession?: Session | null;
}) {
  return (
    <ReactQueryProvider>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <AuthProvider initialSession={initialSession || null}>
          {children}
        </AuthProvider>
      </ThemeProvider>
    </ReactQueryProvider>
  );
}
