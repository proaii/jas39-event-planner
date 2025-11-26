"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Provider } from "@supabase/supabase-js";
import { useSignIn, useSocialLogin } from "@/lib/client/features/auth/hooks";
import { useToast } from "@/components/ui/use-toast";
import { create } from "zustand";

interface LoginUiState {
  error: string | null;
  setError: (err: string | null) => void;
}

const useLoginUiStore = create<LoginUiState>((set) => ({
  error: null,
  setError: (err) => set({ error: err }),
}));

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { error, setError } = useLoginUiStore();
  const router = useRouter();
  const { toast } = useToast();

  const { mutate: signIn, isPending } = useSignIn();
  const { mutate: socialLogin, isPending: isSocialPending } = useSocialLogin();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    signIn(
      { email, password },
      {
        onSuccess: () => {
          toast({ title: "Success", description: "Logged in successfully!" });
          router.push("/dashboard");
        },
        onError: (err) => {
          const msg = err.message || "Login failed";
          setError(msg);
          toast({ title: "Error", description: msg, variant: "destructive" });
        },
      }
    );
  };

  const handleSocialLogin = (provider: Provider) => {
    setError(null);
    socialLogin(provider, {
      onError: (err) => {
        const msg = err.message || "Social login failed";
        setError(msg);
        toast({ title: "Error", description: msg, variant: "destructive" });
      },
    });
  };

  return (
    <div className="w-full max-w-md">
      <Card className="border-0 shadow-lg">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-xl">Welcome Back</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isPending}
              />
              <div className="text-right text-sm mt-1">
                <button
                  type="button"
                  onClick={() => router.push("/auth/forgot-password")}
                  className="text-primary hover:text-primary/80 font-medium"
                  disabled={isPending || isSocialPending}
                >
                  Forgot Password?
                </button>
              </div>
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <Button
              type="submit"
              className="w-full"
              size="lg"
              loading={isPending}
              disabled={isPending || isSocialPending}
            >
              Sign In
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <Button
              type="button"
              variant="outline"
              className="w-full"
              size="lg"
              onClick={() => handleSocialLogin("google")}
              loading={isSocialPending}
              disabled={isPending || isSocialPending}
            >
              Sign in with Google
            </Button>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              size="lg"
              onClick={() => handleSocialLogin("discord")}
              loading={isSocialPending}
              disabled={isPending || isSocialPending}
            >
              Sign in with Discord
            </Button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <button
                onClick={() => router.push("/auth/sign-up")}
                className="text-primary hover:text-primary/80 font-medium"
                disabled={isPending || isSocialPending}
              >
                Sign Up
              </button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
