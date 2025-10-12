'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface ErrorDisplayProps {
  code: string;
  message: string;
  description?: string;
}

export function ErrorDisplay({ code, message, description }: ErrorDisplayProps) {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle className="text-6xl font-bold">{code}</CardTitle>
          <CardDescription className="text-xl">{message}</CardDescription>
        </CardHeader>
        <CardContent>
          {description && (
            <p className="mb-4 text-muted-foreground">{description}</p>
          )}
          <Button asChild>
            <Link href="/">Go back to Home</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}