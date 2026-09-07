'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get('callbackUrl') || '/profile';
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(
    params.get('error') ? 'Sign-in failed. Check your details and try again.' : null,
  );

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    const res = await signIn('credentials', {
      email: String(form.get('email')),
      password: String(form.get('password')),
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      setError('Invalid email or password.');
      return;
    }
    router.push(callbackUrl);
    router.refresh();
  };

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">Log in</h1>
      <p className="mt-1 text-sm text-muted-foreground">Welcome back to the polar science portal.</p>

      {error ? (
        <p className="mt-4 rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <form onSubmit={submit} className="mt-6 space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" autoComplete="email" required />
        </div>
        <div>
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link href="/forgot-password" className="text-xs text-accent hover:underline">
              Forgot password?
            </Link>
          </div>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
          />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null} Log in
        </Button>
      </form>

      <button
        onClick={() => signIn('google', { callbackUrl })}
        className="mt-3 w-full rounded-md border border-input py-2 text-sm font-medium hover:bg-secondary"
      >
        Continue with Google
      </button>
      <p className="mt-2 text-center text-[11px] text-muted-foreground">
        The Google option only works if OAuth credentials are configured.
      </p>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        No account?{' '}
        <Link href="/register" className="text-accent hover:underline">
          Create one
        </Link>
      </p>
    </div>
  );
}
