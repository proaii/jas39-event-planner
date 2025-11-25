'use client';

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useUpdatePassword } from "@/lib/client/features/auth/hooks";
import { create } from "zustand";
import { useToast } from "@/components/ui/use-toast";

interface UpdatePasswordUiState {
  error: string | null;
  setError: (err: string | null) => void;
}

const useUpdatePasswordUiStore = create<UpdatePasswordUiState>((set) => ({
  error: null,
  setError: (err) => set({ error: err }),
}));

export function UpdatePasswordForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [password, setPassword] = useState("");
  const router = useRouter();
  const { toast } = useToast();
  const { error, setError } = useUpdatePasswordUiStore();

  const { mutate, isPending } = useUpdatePassword();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // --- Basic validation ---
    if (password.length < 8) {
      const msg = "Password must be at least 8 characters";
      setError(msg);
      toast({ title: "Error", description: msg, variant: "destructive" });
      return;
    }

    mutate(password, {
      onSuccess: () => {
        toast({ title: "Success", description: "Password updated!" });
        router.push("/dashboard");
      },
      onError: (err: unknown) => {
        // Use type narrowing instead of `any`
        const msg = err instanceof Error ? err.message : "Failed to update password";
        setError(msg);
        toast({ title: "Error", description: msg, variant: "destructive" });
      },
    });
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Reset Your Password</CardTitle>
          <CardDescription>
            Please enter your new password below.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              {/* Input */}
              <div className="grid gap-2">
                <Label htmlFor="password">New password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="New password"
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError(null); // Clear error on typing
                  }}
                  disabled={isPending}
                />
              </div>

              {/* Error */}
              {error && (
                <p className="text-sm text-red-500">{error}</p>
              )}

              {/* Submit */}
              <Button
                type="submit"
                className="w-full"
                loading={isPending}
                disabled={isPending}
              >
                Save new password
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
