'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { registerSchema } from '@/lib/validation';

export function RegisterForm() {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [formError, setFormError] = React.useState<string | null>(null);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    setFormError(null);

    const fd = new FormData(e.currentTarget);
    const payload = {
      name: String(fd.get('name') ?? ''),
      email: String(fd.get('email') ?? ''),
      password: String(fd.get('password') ?? ''),
    };

    const parsed = registerSchema.safeParse(payload);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        fieldErrors[String(issue.path[0])] = issue.message;
      }
      setErrors(fieldErrors);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed.data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error?.message ?? 'Registration failed');

      await signIn('credentials', {
        email: parsed.data.email,
        password: parsed.data.password,
        redirect: false,
      });
      router.push('/profile');
      router.refresh();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Something went wrong');
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">Create your account</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Free. Lets you bookmark research, save resources and register for events.
      </p>

      {formError ? (
        <p className="mt-4 rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
          {formError}
        </p>
      ) : null}

      <form onSubmit={submit} className="mt-6 space-y-4" noValidate>
        <div>
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" autoComplete="name" required />
          {errors.name ? <p className="mt-1 text-xs text-destructive">{errors.name}</p> : null}
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" autoComplete="email" required />
          {errors.email ? <p className="mt-1 text-xs text-destructive">{errors.email}</p> : null}
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
          />
          <p className="mt-1 text-xs text-muted-foreground">
            At least 8 characters with an uppercase letter, a lowercase letter and a number.
          </p>
          {errors.password ? (
            <p className="mt-1 text-xs text-destructive">{errors.password}</p>
          ) : null}
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null} Create account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link href="/login" className="text-accent hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
