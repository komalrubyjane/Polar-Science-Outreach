'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ExternalLink, Trash2, Loader2, Search, Eye, Archive } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { STATUS_LABELS } from '@/lib/constants';

export interface ContentRow {
  id: string;
  title: string;
  slug?: string;
  name?: string;
  status: string | null;
  isDemo?: boolean;
  createdAt: string | Date;
}

interface Row {
  id: string;
  title: string;
  slug: string;
  status: string | null;
  isDemo: boolean;
  createdAt: string;
}

const VARIANT: Record<string, 'success' | 'warning' | 'secondary' | 'danger'> = {
  PUBLISHED: 'success',
  APPROVED: 'success',
  DRAFT: 'secondary',
  SUBMITTED: 'warning',
  UNDER_REVIEW: 'warning',
  ARCHIVED: 'secondary',
  REJECTED: 'danger',
};

export function ContentTable({
  rows: initial,
  apiBase,
  publicBase,
  hasStatus,
}: {
  rows: Row[];
  apiBase: string;
  publicBase: string;
  hasStatus: boolean;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [rows, setRows] = React.useState(initial);
  const [q, setQ] = React.useState('');
  const [busy, setBusy] = React.useState<string | null>(null);

  const filtered = rows.filter((r) => !q || r.title.toLowerCase().includes(q.toLowerCase()));

  const setStatus = async (id: string, status: 'PUBLISHED' | 'ARCHIVED') => {
    setBusy(id);
    try {
      const res = await fetch(`${apiBase}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error?.message ?? 'Update failed');
      setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
      toast({ variant: 'success', title: `Set to ${STATUS_LABELS[status] ?? status}` });
      router.refresh();
    } catch (err) {
      toast({
        variant: 'error',
        title: 'Update failed',
        description: err instanceof Error ? err.message : undefined,
      });
    } finally {
      setBusy(null);
    }
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this record permanently?')) return;
    setBusy(id);
    try {
      const res = await fetch(`${apiBase}/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error?.message ?? 'Delete failed');
      setRows((prev) => prev.filter((r) => r.id !== id));
      toast({ variant: 'success', title: 'Deleted' });
      router.refresh();
    } catch (err) {
      toast({
        variant: 'error',
        title: 'Delete failed',
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
          placeholder="Filter by title…"
          className="pl-9"
        />
      </div>
      <p className="mb-2 text-xs text-muted-foreground">{filtered.length} records</p>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((r) => (
            <TableRow key={r.id}>
              <TableCell>
                <div className="font-medium">{r.title}</div>
                {r.isDemo ? <Badge variant="demo">Demo</Badge> : null}
              </TableCell>
              <TableCell>
                {r.status ? (
                  <Badge variant={VARIANT[r.status] ?? 'secondary'}>
                    {STATUS_LABELS[r.status] ?? r.status}
                  </Badge>
                ) : (
                  <span className="text-xs text-muted-foreground">—</span>
                )}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {formatDate(r.createdAt)}
              </TableCell>
              <TableCell>
                <div className="flex items-center justify-end gap-1">
                  {r.slug ? (
                    <Button asChild size="icon" variant="ghost" aria-label="View public page">
                      <Link href={`${publicBase}/${r.slug}`} target="_blank">
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                    </Button>
                  ) : null}
                  {hasStatus && r.status !== 'PUBLISHED' ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setStatus(r.id, 'PUBLISHED')}
                      disabled={busy === r.id}
                    >
                      <Eye className="h-4 w-4" /> Publish
                    </Button>
                  ) : null}
                  {hasStatus && r.status === 'PUBLISHED' ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setStatus(r.id, 'ARCHIVED')}
                      disabled={busy === r.id}
                    >
                      <Archive className="h-4 w-4" /> Archive
                    </Button>
                  ) : null}
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => remove(r.id)}
                    disabled={busy === r.id}
                    aria-label="Delete"
                  >
                    {busy === r.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4 text-destructive" />
                    )}
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
          {filtered.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">
                No records.
              </TableCell>
            </TableRow>
          ) : null}
        </TableBody>
      </Table>
    </div>
  );
}
