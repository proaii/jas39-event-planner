"use client";

import { useEffect, useState } from "react";
import { supabaseClient } from "@/lib/client/supabase/client";

export default function CurrentUser() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    async function fetchUser() {
      const { data: { user }, error } = await supabaseClient.auth.getUser();

      if (error) {
        console.error("Error fetching user:", error.message);
        return;
      }

      setUser(user);
    }

    fetchUser();
  }, []);

  if (!user) return <div>Loading...</div>;

  return (
    <div>
      <h2>Current User</h2>
      <p>ID: {user.id}</p>
      <p>Email: {user.email}</p>
      <p>Created At: {user.created_at}</p>
    </div>
  );
}