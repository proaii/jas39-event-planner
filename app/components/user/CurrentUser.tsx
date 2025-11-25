"use client";

import { useFetchCurrentUser } from "@/lib/client/features/users/hooks";
import Image from "next/image"; 

export default function CurrentUser() {
  const { data: user, isLoading, error } = useFetchCurrentUser();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-destructive">
        Error loading user: {error.message}
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-8 text-muted-foreground">
        Not logged in
      </div>
    );
  }

  return (
    <div className="p-8 space-y-4">
      <h2 className="text-2xl font-bold">Current User</h2>
      <div className="space-y-2">
        <p><span className="font-medium">ID:</span> {user.userId}</p>
        <p><span className="font-medium">Username:</span> {user.username}</p>
        <p><span className="font-medium">Email:</span> {user.email}</p>
        {user.avatarUrl && (
          <div>
            <span className="font-medium">Avatar:</span>
            <div className="mt-2 relative h-16 w-16">
              <Image 
                src={user.avatarUrl} 
                alt={user.username} 
                fill
                className="rounded-full object-cover"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
