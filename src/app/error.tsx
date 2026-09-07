'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Client-visible error boundary. The server has already logged details.
    console.error(error);
  }, [error]);

  return (
    <div className="container-page flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <AlertTriangle className="mb-4 h-12 w-12 text-destructive" />
      <h1 className="font-display text-2xl font-semibold">Something went wrong</h1>
      <p className="mt-2 max-w-md text-muted-foreground">
        An unexpected error occurred while rendering this page. You can try again, or head back to
        the homepage.
      </p>
      {error.digest ? (
        <p className="mt-2 text-xs text-muted-foreground">Reference: {error.digest}</p>
      ) : null}
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Button onClick={reset}>Try again</Button>
        <Button asChild variant="outline">
          <Link href="/">Return home</Link>
        </Button>
      </div>
    </div>
  );
}
