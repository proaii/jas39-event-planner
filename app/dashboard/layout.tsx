import { Sidebar } from "@/components/sidebar";
import { createClient } from "@/lib/server/supabase/server";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/error?code=401&message=You are not authorized to view this page.");
  }

  return (
    <div className="flex flex-1 w-full h-full">
      <Sidebar />
      <main className="flex-1 p-6 bg-muted/20 overflow-auto">{children}</main>
    </div>
  );
}
