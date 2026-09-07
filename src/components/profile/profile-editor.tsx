'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input, Textarea } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';

export function ProfileEditor({
  initial,
}: {
  initial: { name: string; bio: string; organization: string };
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [form, setForm] = React.useState(initial);
  const [loading, setLoading] = React.useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error((await res.json())?.error?.message ?? 'Update failed');
      toast({ variant: 'success', title: 'Profile updated' });
      router.refresh();
    } catch (err) {
      toast({
        variant: 'error',
        title: 'Could not update profile',
        description: err instanceof Error ? err.message : undefined,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <Label htmlFor="p-name">Name</Label>
        <Input
          id="p-name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
      </div>
      <div>
        <Label htmlFor="p-org">Organisation</Label>
        <Input
          id="p-org"
          value={form.organization}
          onChange={(e) => setForm({ ...form, organization: e.target.value })}
        />
      </div>
      <div>
        <Label htmlFor="p-bio">Bio</Label>
        <Textarea
          id="p-bio"
          rows={4}
          value={form.bio}
          onChange={(e) => setForm({ ...form, bio: e.target.value })}
        />
      </div>
      <Button type="submit" disabled={loading}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null} Save changes
      </Button>
    </form>
  );
}
