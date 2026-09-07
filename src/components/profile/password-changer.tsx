'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';

export function PasswordChanger({ mustChange = false }: { mustChange?: boolean }) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    try {
      const res = await fetch('/api/profile/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: String(fd.get('current')),
          newPassword: String(fd.get('next')),
        }),
      });
      if (!res.ok) throw new Error((await res.json())?.error?.message ?? 'Change failed');
      toast({ variant: 'success', title: 'Password updated' });
      (e.target as HTMLFormElement).reset();
      if (mustChange) {
        router.push('/profile');
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      {mustChange ? (
        <p className="rounded-md border border-warning/50 bg-warning/10 p-3 text-sm text-warning dark:text-warning">
          For security, you must change the password on this account before continuing.
        </p>
      ) : null}
      {error ? (
        <p className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
          {error}
        </p>
      ) : null}
      <div>
        <Label htmlFor="current">Current password</Label>
        <Input id="current" name="current" type="password" autoComplete="current-password" required />
      </div>
      <div>
        <Label htmlFor="next">New password</Label>
        <Input id="next" name="next" type="password" autoComplete="new-password" required />
        <p className="mt-1 text-xs text-muted-foreground">
          At least 8 characters with upper, lower and a number.
        </p>
      </div>
      <Button type="submit" disabled={loading}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null} Update password
      </Button>
    </form>
  );
}
