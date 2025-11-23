import { NextResponse } from "next/server";
import { createClient } from "@/lib/server/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return NextResponse.json({ error: error?.message || "User not found" }, { status: 401 });
  }

  return NextResponse.json({ user });
}