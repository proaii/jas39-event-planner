'use client';

import { useSearchParams } from 'next/navigation';
import { ErrorDisplay } from '@/components/error-display';
import { Suspense } from 'react';

function ErrorContent() {
  const searchParams = useSearchParams();
  const code = searchParams.get('code') || '500';
  const message = searchParams.get('message') || 'Something went wrong.';

  return <ErrorDisplay code={code} message={message} />;
}

export default function ErrorPage() {
  return (
    <Suspense fallback={null}>
      <ErrorContent />
    </Suspense>
  );
}