import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Calendar, ArrowLeft, CheckCircle2 } from "lucide-react";

interface ForgotPasswordProps {
  onNavigateToLogin: () => void;
}

export function ForgotPassword({ onNavigateToLogin }: ForgotPasswordProps) {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple validation for demo
    if (email) {
      setIsSubmitted(true);
    }
  };

  return (
    <div className="flex items-center justify-center p-4 min-h-[calc(100vh-80px)]">
      <div className="w-full max-w-md">
        {/* App Logo and Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl mb-4">
            <Calendar className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Student Event Planner
          </h1>
          <p className="text-muted-foreground">
            Reset your password
          </p>
        </div>

        {/* Forgot Password Form */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl">
              {isSubmitted ? "Check Your Email" : "Forgot Password?"}
            </CardTitle>
            <CardDescription>
              {isSubmitted
                ? "We've sent password reset instructions to your email"
                : "Enter your email address and we'll send you instructions to reset your password"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isSubmitted ? (
              /* Success State */
              <div className="space-y-6">
                <div className="flex flex-col items-center justify-center py-6">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle2 className="w-8 h-8 text-green-600" />
                  </div>
                  <p className="text-center text-muted-foreground mb-2">
                    If an account exists for{" "}
                    <span className="font-medium text-foreground">{email}</span>,
                    you will receive an email with instructions to reset your password.
                  </p>
                  <p className="text-sm text-muted-foreground text-center">
                    Don't see the email? Check your spam folder.
                  </p>
                </div>

                <Button
                  onClick={onNavigateToLogin}
                  className="w-full bg-primary hover:bg-primary/90"
                  size="lg"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Sign In
                </Button>
              </div>
            ) : (
              /* Form State */
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-input-background"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90"
                  size="lg"
                >
                  Send Reset Instructions
                </Button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={onNavigateToLogin}
                    className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center"
                  >
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Back to Sign In
                  </button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
