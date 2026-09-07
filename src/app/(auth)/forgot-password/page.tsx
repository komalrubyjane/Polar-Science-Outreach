'use client';

import * as React from 'react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function ForgotPasswordPage() {
  const [state, setState] = React.useState<'idle' | 'loading' | 'sent'>('idle');

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setState('loading');
    const fd = new FormData(e.currentTarget);
    await fetch('/api/auth/password-reset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: String(fd.get('email')) }),
    }).catch(() => undefined);
    setState('sent');
  };

  if (state === 'sent') {
    return (
      <div>
        <h1 className="font-display text-2xl font-semibold">Check your email</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          If an account exists for that address, we&apos;ve sent a password-reset link. It expires
          in one hour.
        </p>
        <Link href="/login" className="mt-6 inline-block text-sm text-accent hover:underline">
          Back to log in
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">Reset your password</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Enter your email and we&apos;ll send you a reset link.
      </p>
      <form onSubmit={submit} className="mt-6 space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" autoComplete="email" required />
        </div>
        <Button type="submit" className="w-full" disabled={state === 'loading'}>
          {state === 'loading' ? <Loader2 className="h-4 w-4 animate-spin" /> : null} Send reset link
        </Button>
      </form>
      <Link href="/login" className="mt-6 inline-block text-sm text-accent hover:underline">
        Back to log in
      </Link>
    </div>
  );
}
