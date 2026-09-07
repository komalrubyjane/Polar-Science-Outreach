'use client';

import * as React from 'react';
import { Loader2, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';

export function NewsletterForm({
  compact = false,
  source = 'site',
}: {
  compact?: boolean;
  source?: string;
}) {
  const { toast } = useToast();
  const [email, setEmail] = React.useState('');
  const [state, setState] = React.useState<'idle' | 'loading' | 'done'>('idle');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState('loading');
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error?.message ?? 'Subscription failed');
      setState('done');
      toast({
        variant: 'success',
        title: 'Almost there',
        description:
          'Check your inbox to confirm your subscription. You can unsubscribe at any time.',
      });
      setEmail('');
    } catch (err) {
      setState('idle');
      toast({
        variant: 'error',
        title: 'Could not subscribe',
        description: err instanceof Error ? err.message : 'Please try again later.',
      });
    }
  };

  if (state === 'done') {
    return (
      <p className="text-sm text-muted-foreground">
        Thanks — please confirm via the link we just emailed you.
      </p>
    );
  }

  return (
    <form onSubmit={submit} className={compact ? 'space-y-2' : 'flex flex-col gap-3 sm:flex-row'}>
      <div className="relative flex-1">
        <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.org"
          aria-label="Email address for newsletter"
          className="pl-9"
        />
      </div>
      <Button type="submit" disabled={state === 'loading'}>
        {state === 'loading' ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        Subscribe
      </Button>
    </form>
  );
}
