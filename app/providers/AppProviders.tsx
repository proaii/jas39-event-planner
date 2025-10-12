'use client';

import { ThemeProvider } from 'next-themes';
import { ReactQueryProvider } from './ReactQueryProvider';
import { AuthProvider } from './AuthProvider';

export function AppProviders({
  children,
  initialSession,
}: {
  children: React.ReactNode;
  initialSession?: any;
}) {
  return (
    <ReactQueryProvider>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <AuthProvider initialSession={initialSession}>
          {children}
        </AuthProvider>
      </ThemeProvider>
    </ReactQueryProvider>
  );
}
