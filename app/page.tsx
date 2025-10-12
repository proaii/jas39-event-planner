import { Hero } from "@/components/hero";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="flex-1 w-full flex flex-col items-center justify-center">
      <div className="max-w-5xl w-full px-5">
        <Hero />
      </div>
    </div>
  );
}
