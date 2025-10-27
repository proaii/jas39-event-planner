import Link from "next/link";
import { Button } from "./ui/button";
import { createClient } from "@/lib/server/supabase/server";

export async function Hero() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="text-center flex flex-col gap-6 items-center py-24">
      <h1 className="text-4xl md:text-6xl font-bold tracking-tighter">
        JAS39 Event Planner
      </h1>
      <p className="text-lg md:text-xl text-muted-foreground max-w-2xl">
        Effortlessly plan, manage, and execute your events with our powerful and
        intuitive event planning platform.
      </p>
      <Button asChild size="lg">
        <Link href={user ? "/dashboard" : "/auth/sign-up"}>Get Started</Link>
      </Button>
    </div>
  );
}