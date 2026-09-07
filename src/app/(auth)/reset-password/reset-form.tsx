'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { registerSchema } from '@/lib/validation';

export function ResetPasswordForm() {
  const router = useRouter();
  const token = useSearchParams().get('token') ?? '';
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [done, setDone] = React.useState(false);

  if (!token) {
    return (
      <div>
        <h1 className="font-display text-2xl font-semibold">Invalid link</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This password-reset link is missing its token. Request a new one.
        </p>
        <Link
          href="/forgot-password"
          className="mt-6 inline-block text-sm text-accent hover:underline"
        >
          Request a new link
        </Link>
      </div>
    );
  }

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const password = String(new FormData(e.currentTarget).get('password') ?? '');
    const parsed = registerSchema.shape.password.safeParse(password);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Weak password');
      setLoading(false);
      return;
    }
    try {
      const res = await fetch('/api/auth/password-reset', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error?.message ?? 'Reset failed');
      setDone(true);
      setTimeout(() => router.push('/login'), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div>
        <h1 className="font-display text-2xl font-semibold">Password updated</h1>
        <p className="mt-2 text-sm text-muted-foreground">Redirecting you to log in…</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">Set a new password</h1>
      {error ? (
        <p className="mt-4 rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
          {error}
        </p>
      ) : null}
      <form onSubmit={submit} className="mt-6 space-y-4">
        <div>
          <Label htmlFor="password">New password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
          />
          <p className="mt-1 text-xs text-muted-foreground">
            At least 8 characters with upper, lower and a number.
          </p>
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null} Update password
        </Button>
      </form>
    </div>
  );
}
