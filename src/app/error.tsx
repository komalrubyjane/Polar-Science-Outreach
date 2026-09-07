'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="editorial flex min-h-[70vh] flex-col justify-center py-24">
      <span className="eyebrow eyebrow-accent">
        <span className="h-px w-6 bg-current" aria-hidden />
        System error
      </span>
      <h1 className="display-1 mt-6 text-balance">Something went off course.</h1>
      <p className="mt-6 max-w-md text-lg text-muted-foreground">
        The polar signal was lost. You can try again, or head back to the homepage.
      </p>
      {error.digest ? (
        <p className="metadata mt-4">Reference {error.digest}</p>
      ) : null}
      <div className="mt-10 flex flex-wrap gap-4">
        <Button onClick={reset} size="lg">
          Try again
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link href="/">Return home</Link>
        </Button>
      </div>
    </div>
  );
}
