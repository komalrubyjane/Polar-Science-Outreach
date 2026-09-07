'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, Loader2, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/components/ui/use-toast';
import { formatDate } from '@/lib/utils';

interface Row {
  id: string;
  name: string | null;
  email: string;
  role: string;
  organization: string | null;
  verified: boolean;
  createdAt: string;
  submissions: number;
  bookmarks: number;
}

const ROLES = ['USER', 'RESEARCHER', 'EDITOR', 'ADMIN'];

export function UsersTable({
  initial,
  currentUserId,
}: {
  initial: Row[];
  currentUserId: string;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [rows, setRows] = React.useState(initial);
  const [q, setQ] = React.useState('');
  const [busy, setBusy] = React.useState<string | null>(null);

  const filtered = rows.filter(
    (r) =>
      !q ||
      r.email.toLowerCase().includes(q.toLowerCase()) ||
      (r.name ?? '').toLowerCase().includes(q.toLowerCase()),
  );

  const changeRole = async (id: string, role: string) => {
    setBusy(id);
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error?.message ?? 'Update failed');
      setRows((prev) => prev.map((r) => (r.id === id ? { ...r, role } : r)));
      toast({ variant: 'success', title: 'Role updated' });
      router.refresh();
    } catch (err) {
      toast({
        variant: 'error',
        title: 'Could not change role',
        description: err instanceof Error ? err.message : undefined,
      });
    } finally {
      setBusy(null);
    }
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this user? This cannot be undone.')) return;
    setBusy(id);
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error?.message ?? 'Delete failed');
      setRows((prev) => prev.filter((r) => r.id !== id));
      toast({ variant: 'success', title: 'User deleted' });
      router.refresh();
    } catch (err) {
      toast({
        variant: 'error',
        title: 'Could not delete user',
        description: err instanceof Error ? err.message : undefined,
      });
    } finally {
      setBusy(null);
    }
  };

  return (
    <div>
      <div className="relative mb-4 max-w-xs">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Filter by name or email…"
          className="pl-9"
        />
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Activity</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((r) => (
            <TableRow key={r.id}>
              <TableCell>
                <div className="font-medium">{r.name ?? '—'}</div>
                <div className="text-xs text-muted-foreground">{r.email}</div>
                {r.organization ? (
                  <div className="text-xs text-muted-foreground">{r.organization}</div>
                ) : null}
              </TableCell>
              <TableCell>
                <Select
                  value={r.role}
                  onValueChange={(v) => changeRole(r.id, v)}
                  disabled={r.id === currentUserId || busy === r.id}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLES.map((role) => (
                      <SelectItem key={role} value={role}>
                        {role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell className="text-xs text-muted-foreground">
                {r.submissions} submissions
                <br />
                {r.bookmarks} bookmarks
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {formatDate(r.createdAt)}
              </TableCell>
              <TableCell className="text-right">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => remove(r.id)}
                  disabled={r.id === currentUserId || busy === r.id}
                  aria-label={`Delete ${r.email}`}
                >
                  {busy === r.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4 text-destructive" />
                  )}
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {filtered.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                No users match.
              </TableCell>
            </TableRow>
          ) : null}
        </TableBody>
      </Table>
    </div>
  );
}
