'use client';

import * as React from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input, Textarea } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';

export function EventRegistration({
  eventId,
  registrationUrl,
  registrationStatus,
  initiallyRegistered = false,
}: {
  eventId: string;
  registrationUrl: string | null;
  registrationStatus: string;
  initiallyRegistered?: boolean;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [registered, setRegistered] = React.useState(initiallyRegistered);
  const [loading, setLoading] = React.useState(false);
  const [form, setForm] = React.useState({ name: '', email: '', note: '' });

  React.useEffect(() => {
    if (session?.user) {
      setForm((f) => ({
        ...f,
        name: f.name || session.user.name || '',
        email: f.email || session.user.email || '',
      }));
    }
  }, [session]);

  if (registrationStatus === 'NOT_REQUIRED') {
    return (
      <p className="rounded-lg border border-border bg-card p-4 text-sm text-muted-foreground">
        No registration required — just show up (or join online).
      </p>
    );
  }

  if (registrationUrl) {
    return (
      <Button asChild className="w-full">
        <a href={registrationUrl} target="_blank" rel="noopener noreferrer">
          Register on organiser’s site
        </a>
      </Button>
    );
  }

  if (registered) {
    return (
      <div className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 p-4 text-sm">
        <p className="flex items-center gap-2 font-medium text-emerald-700 dark:text-emerald-300">
          <CheckCircle2 className="h-4 w-4" /> You’re registered
        </p>
        <button
          onClick={async () => {
            setLoading(true);
            await fetch(`/api/events/${eventId}/register`, { method: 'DELETE' });
            setRegistered(false);
            setLoading(false);
          }}
          className="mt-2 text-xs text-muted-foreground underline"
        >
          Cancel my registration
        </button>
      </div>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status !== 'authenticated') {
      router.push(`/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/events/${eventId}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error?.message ?? 'Registration failed');
      setRegistered(true);
      toast({ variant: 'success', title: 'You are registered for this event' });
    } catch (err) {
      toast({
        variant: 'error',
        title: 'Could not register',
        description: err instanceof Error ? err.message : undefined,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-3 rounded-lg border border-border bg-card p-4">
      <p className="text-sm font-semibold">Register for this event</p>
      <div>
        <Label htmlFor="reg-name">Name</Label>
        <Input
          id="reg-name"
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
      </div>
      <div>
        <Label htmlFor="reg-email">Email</Label>
        <Input
          id="reg-email"
          type="email"
          required
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
      </div>
      <div>
        <Label htmlFor="reg-note">Note (optional)</Label>
        <Textarea
          id="reg-note"
          value={form.note}
          onChange={(e) => setForm({ ...form, note: e.target.value })}
          rows={2}
        />
      </div>
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        {registrationStatus === 'WAITLIST' ? 'Join waitlist' : 'Register'}
      </Button>
      {status !== 'authenticated' ? (
        <p className="text-xs text-muted-foreground">You’ll be asked to sign in first.</p>
      ) : null}
    </form>
  );
}
