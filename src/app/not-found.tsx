import Link from 'next/link';
import { Compass } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="container-page flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <Compass className="mb-4 h-12 w-12 text-accent" />
      <p className="font-display text-6xl font-bold tracking-tight">404</p>
      <h1 className="mt-2 font-display text-2xl font-semibold">Off the map</h1>
      <p className="mt-2 max-w-md text-muted-foreground">
        We couldn&apos;t find that page. It may have moved, or the link may be out of date.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Button asChild>
          <Link href="/">Return home</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/repository">Browse the repository</Link>
        </Button>
      </div>
    </div>
  );
}
