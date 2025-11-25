import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { createClient } from "@/lib/server/supabase/server";
import { AppProviders } from "@/app/providers/AppProviders";
import "./globals.css";
import { TopNavigation } from "@/components/top-navigation";

const geistSans = Geist({
  variable: "--font-geist-sans",
  display: "swap",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "JAS39 Event Planner",
  description: "Modern setup with React Query, ThemeProvider, Supabase auth",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Get session from server side (serialize)
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.className} antialiased`}>
        <AppProviders initialSession={session}>
          <TopNavigation />
          {children}
        </AppProviders>
      </body>
    </html>
  );
}