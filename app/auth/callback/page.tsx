'use client';

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/protected";

  useEffect(() => {
    const supabase = createClient();

    async function confirmSession() {
      for (let i = 0; i < 10; i++) { // Check up to 5 seconds
        const { data, error } = await supabase.auth.getSession();
        if (data?.session && !error) {
          console.log("✅ Session ready:", data.session.user.email);
          router.replace(next);
          return;
        }
        await new Promise((r) => setTimeout(r, 500));
      }

      // If still don't see the session after 5 seconds, go back to login.
      router.replace("/auth/login");
    }

    confirmSession();
  }, [router, next]);

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <div className="animate-pulse text-gray-500 text-sm">
        
      </div>
    </div>
  );
}