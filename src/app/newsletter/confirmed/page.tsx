import type { Metadata } from 'next';
import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = { title: 'Subscription confirmed' };

export default function NewsletterConfirmedPage() {
  return (
    <div className="container-page flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
      <CheckCircle2 className="mb-4 h-12 w-12 text-emerald-500" />
      <h1 className="font-display text-2xl font-semibold">You&apos;re subscribed</h1>
      <p className="mt-2 max-w-md text-muted-foreground">
        Thanks for confirming. You&apos;ll receive the monthly polar science digest. Every email
        includes a one-click unsubscribe link.
      </p>
      <Button asChild className="mt-6">
        <Link href="/">Back to the portal</Link>
      </Button>
    </div>
  );
}
