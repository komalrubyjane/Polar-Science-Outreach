'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Check, X, MessageSquare, Loader2, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { formatDateTime } from '@/lib/utils';
import { STATUS_LABELS } from '@/lib/constants';

interface Submission {
  id: string;
  kind: string;
  title: string;
  status: string;
  submittedAt: string;
  author: { name: string | null; email: string } | null;
  payload: Record<string, unknown>;
  lastComment: string | null;
  lastReviewer: string | null;
}

const VARIANT: Record<string, 'warning' | 'success' | 'danger' | 'secondary'> = {
  SUBMITTED: 'warning',
  UNDER_REVIEW: 'warning',
  APPROVED: 'success',
  REJECTED: 'danger',
  ARCHIVED: 'secondary',
};

export function SubmissionsReview({ initial }: { initial: Submission[] }) {
  const router = useRouter();
  const { toast } = useToast();
  const [items, setItems] = React.useState(initial);
  const [comments, setComments] = React.useState<Record<string, string>>({});
  const [busy, setBusy] = React.useState<string | null>(null);
  const [expanded, setExpanded] = React.useState<string | null>(null);

  const decide = async (
    id: string,
    decision: 'APPROVED' | 'REJECTED' | 'CHANGES_REQUESTED',
  ) => {
    setBusy(id);
    try {
      const res = await fetch(`/api/submissions/${id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision, comment: comments[id] ?? '' }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error?.message ?? 'Action failed');
      setItems((prev) =>
        prev.map((s) =>
          s.id === id
            ? {
                ...s,
                status:
                  decision === 'APPROVED'
                    ? 'APPROVED'
                    : decision === 'REJECTED'
                      ? 'REJECTED'
                      : 'UNDER_REVIEW',
                lastComment: comments[id] ?? s.lastComment,
              }
            : s,
        ),
      );
      toast({ variant: 'success', title: `Submission ${decision.toLowerCase().replace('_', ' ')}` });
      router.refresh();
    } catch (err) {
      toast({
        variant: 'error',
        title: 'Could not complete review',
        description: err instanceof Error ? err.message : undefined,
      });
    } finally {
      setBusy(null);
    }
  };

  const pending = items.filter((s) => ['SUBMITTED', 'UNDER_REVIEW'].includes(s.status));
  const decided = items.filter((s) => !['SUBMITTED', 'UNDER_REVIEW'].includes(s.status));

  const Row = ({ s }: { s: Submission }) => {
    const open = expanded === s.id;
    const isPending = ['SUBMITTED', 'UNDER_REVIEW'].includes(s.status);
    return (
      <div className="rounded-xl border border-border bg-card">
        <button
          onClick={() => setExpanded(open ? null : s.id)}
          className="flex w-full items-center gap-3 p-4 text-left"
        >
          <Badge variant={VARIANT[s.status] ?? 'secondary'}>
            {STATUS_LABELS[s.status] ?? s.status}
          </Badge>
          <span className="font-medium">{s.title}</span>
          <span className="text-xs text-muted-foreground">{s.kind}</span>
          <span className="ml-auto text-xs text-muted-foreground">
            {s.author?.name ?? s.author?.email} · {formatDateTime(s.submittedAt)}
          </span>
          <ChevronDown className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
        {open ? (
          <div className="border-t border-border p-4">
            <pre className="max-h-64 overflow-auto rounded-md bg-muted/50 p-3 text-xs">
              {JSON.stringify(s.payload, null, 2)}
            </pre>
            {s.lastComment ? (
              <p className="mt-2 rounded bg-muted/50 p-2 text-xs">
                <strong>Previous review{s.lastReviewer ? ` (${s.lastReviewer})` : ''}:</strong>{' '}
                {s.lastComment}
              </p>
            ) : null}
            {isPending ? (
              <>
                <Textarea
                  className="mt-3"
                  rows={2}
                  placeholder="Reviewer comment (sent to the author)…"
                  value={comments[s.id] ?? ''}
                  onChange={(e) => setComments((c) => ({ ...c, [s.id]: e.target.value }))}
                />
                <div className="mt-2 flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    onClick={() => decide(s.id, 'APPROVED')}
                    disabled={busy === s.id}
                  >
                    {busy === s.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                    Approve &amp; publish
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => decide(s.id, 'CHANGES_REQUESTED')}
                    disabled={busy === s.id}
                  >
                    <MessageSquare className="h-4 w-4" /> Request changes
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => decide(s.id, 'REJECTED')}
                    disabled={busy === s.id}
                  >
                    <X className="h-4 w-4" /> Reject
                  </Button>
                </div>
              </>
            ) : null}
          </div>
        ) : null}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <section>
        <h2 className="mb-2 text-sm font-semibold text-muted-foreground">
          Pending ({pending.length})
        </h2>
        {pending.length ? (
          <div className="space-y-2">
            {pending.map((s) => (
              <Row key={s.id} s={s} />
            ))}
          </div>
        ) : (
          <p className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            Nothing waiting for review.
          </p>
        )}
      </section>

      {decided.length ? (
        <section>
          <h2 className="mb-2 text-sm font-semibold text-muted-foreground">
            Decided ({decided.length})
          </h2>
          <div className="space-y-2">
            {decided.map((s) => (
              <Row key={s.id} s={s} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
