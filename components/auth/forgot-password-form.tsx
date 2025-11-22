"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/server/supabase/client";
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
import Link from "next/link";
import { useState } from "react";
import { useAuthUiStore } from "@/stores/auth-ui-store";
import { useToast } from "@/components/ui/use-toast";

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");

  // Zustand store
  const {
    forgotPassword,
    setForgotPasswordLoading,
    setForgotPasswordError,
    setForgotPasswordSuccess,
    resetForgotPasswordState,
  } = useAuthUiStore();

  const { toast } = useToast();

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();

    setForgotPasswordLoading(true);
    setForgotPasswordError(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/update-password`,
      });
      if (error) throw error;

      setForgotPasswordSuccess(true);
      setEmail(""); // clear input
      toast({
        title: "Success",
        description: "Password reset email sent!",
        variant: "default",
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "An error occurred";
      setForgotPasswordError(message);

      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  const handleResetForm = () => {
    resetForgotPasswordState();
    setEmail("");
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      {forgotPassword.success ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Check Your Email</CardTitle>
            <CardDescription>Password reset instructions sent</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              If you registered using your email and password, you will receive
              a password reset email.
            </p>
            <Button className="mt-4" onClick={handleResetForm}>
              Reset Another Password
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Reset Your Password</CardTitle>
            <CardDescription>
              Type in your email and we&apos;ll send you a link to reset your
              password
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleForgotPassword}>
              <div className="flex flex-col gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={forgotPassword.isLoading}
                  />
                  {forgotPassword.error && (
                    <p className="text-sm text-red-500">{forgotPassword.error}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  loading={forgotPassword.isLoading} 
                >
                  Send reset email
                </Button>
              </div>

              <div className="mt-4 text-center text-sm">
                Already have an account?{" "}
                <Link
                  href="/auth/login"
                  className="underline underline-offset-4"
                >
                  Login
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
