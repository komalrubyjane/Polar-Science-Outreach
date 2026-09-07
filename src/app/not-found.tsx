import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Eyebrow } from '@/components/editorial/primitives';

export default function NotFound() {
  return (
    <div className="editorial flex min-h-[70vh] flex-col justify-center py-24">
      <Eyebrow accent>Error 404</Eyebrow>
      <h1 className="display-1 mt-6 text-balance">Off the map.</h1>
      <p className="mt-6 max-w-md text-lg text-muted-foreground">
        We couldn&apos;t find that page. It may have moved, or the link may be out of date.
      </p>
      <div className="mt-10 flex flex-wrap gap-4">
        <Button asChild size="lg">
          <Link href="/">Return home</Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link href="/repository">Browse the repository</Link>
        </Button>
      </div>
    </div>
  );
}
