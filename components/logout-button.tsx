"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useSignOut } from "@/app/features/auth/hooks"; 

export function LogoutButton() {
  const router = useRouter();
  const { mutate: signOut, isPending } = useSignOut(); 

  const handleLogout = () => {
    signOut(undefined, {
      onSuccess: () => {
        router.replace("/auth/login"); // Use replace to prevent reverse.
        router.refresh(); // Force the middleware to recheck the session.
      },
      onError: (err) => {
        console.error("Logout failed:", err.message);
      },
    });
  };

  return (
    <Button
      onClick={handleLogout}
      disabled={isPending}
      variant="outline"
      className="text-sm font-medium"
    >
      Logout
    </Button>
  );
}
