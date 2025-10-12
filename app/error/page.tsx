'use client';

import { useSearchParams } from 'next/navigation';
import { ErrorDisplay } from '@/components/error-display';

export default function ErrorPage() {
  const searchParams = useSearchParams();
  const code = searchParams.get('code') || '500';
  const message = searchParams.get('message') || 'Something went wrong.';

  return <ErrorDisplay code={code} message={message} />;
}