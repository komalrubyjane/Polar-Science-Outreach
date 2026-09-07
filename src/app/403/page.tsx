import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Eyebrow } from '@/components/editorial/primitives';

export const metadata = { title: 'Access denied' };

export default function ForbiddenPage() {
  return (
    <div className="editorial flex min-h-[70vh] flex-col justify-center py-24">
      <Eyebrow accent>Error 403</Eyebrow>
      <h1 className="display-1 mt-6 text-balance">Access denied.</h1>
      <p className="mt-6 max-w-md text-lg text-muted-foreground">
        Your account doesn&apos;t have permission to view this area. If you think this is a
        mistake, contact an administrator.
      </p>
      <div className="mt-10 flex flex-wrap gap-4">
        <Button asChild size="lg">
          <Link href="/">Return home</Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link href="/profile">Your profile</Link>
        </Button>
      </div>
    </div>
  );
}
