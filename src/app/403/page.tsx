import Link from 'next/link';
import { ShieldX } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata = { title: 'Access denied' };

export default function ForbiddenPage() {
  return (
    <div className="container-page flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <ShieldX className="mb-4 h-12 w-12 text-destructive" />
      <p className="font-display text-6xl font-bold tracking-tight">403</p>
      <h1 className="mt-2 font-display text-2xl font-semibold">Access denied</h1>
      <p className="mt-2 max-w-md text-muted-foreground">
        Your account doesn&apos;t have permission to view this area. If you think this is a
        mistake, contact an administrator.
      </p>
      <div className="mt-6 flex gap-3">
        <Button asChild>
          <Link href="/">Return home</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/profile">Go to your profile</Link>
        </Button>
      </div>
    </div>
  );
}
