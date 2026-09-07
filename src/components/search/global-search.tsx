'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Search, Loader2, CornerDownLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import type { GlobalSearchGroup, GlobalSearchHit } from '@/lib/search';
import { truncate } from '@/lib/utils';

const GROUP_LABELS: Record<GlobalSearchGroup, string> = {
  research: 'Research',
  datasets: 'Datasets',
  media: 'Media',
  news: 'News',
  events: 'Events',
  education: 'Education',
  researchers: 'Researchers',
  institutions: 'Institutions',
  glossary: 'Glossary',
};

export function GlobalSearch() {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [q, setQ] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [groups, setGroups] = React.useState<Record<GlobalSearchGroup, GlobalSearchHit[]> | null>(
    null,
  );
  const [total, setTotal] = React.useState(0);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  React.useEffect(() => {
    if (!open) return;
    const term = q.trim();
    if (term.length < 2) {
      setGroups(null);
      setTotal(0);
      return;
    }
    const ctrl = new AbortController();
    setLoading(true);
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(term)}`, {
          signal: ctrl.signal,
        });
        if (res.ok) {
          const json = await res.json();
          setGroups(json.data.groups);
          setTotal(json.data.total);
        }
      } catch {
        /* aborted or network */
      } finally {
        setLoading(false);
      }
    }, 220);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [q, open]);

  const go = (href: string) => {
    setOpen(false);
    setQ('');
    router.push(href);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (q.trim().length >= 2) go(`/search?q=${encodeURIComponent(q.trim())}`);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 text-muted-foreground sm:w-64 sm:justify-start"
          aria-label="Open site search"
        >
          <Search className="h-4 w-4" />
          <span className="hidden sm:inline">Search the portal…</span>
          <kbd className="ml-auto hidden rounded border border-border bg-muted px-1.5 text-[10px] font-medium sm:inline">
            ⌘K
          </kbd>
        </Button>
      </DialogTrigger>
      <DialogContent className="top-24 max-w-2xl translate-y-0 p-0">
        <DialogHeader className="border-b border-border p-4">
          <DialogTitle className="sr-only">Search the portal</DialogTitle>
          <form onSubmit={submit} className="flex items-center gap-2">
            <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
            {/* eslint-disable-next-line jsx-a11y/no-autofocus */}
            <Input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search research, data, media, events, people…"
              className="border-0 px-0 shadow-none focus-visible:ring-0"
              aria-label="Search query"
            />
            {loading ? <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" /> : null}
          </form>
        </DialogHeader>

        <div className="max-h-[60vh] overflow-y-auto p-2">
          {q.trim().length < 2 ? (
            <p className="p-6 text-center text-sm text-muted-foreground">
              Type at least two characters. Results are grouped by content type.
            </p>
          ) : groups && total === 0 && !loading ? (
            <p className="p-6 text-center text-sm text-muted-foreground">
              No matches for “{q.trim()}”.
            </p>
          ) : groups ? (
            <>
              {(Object.keys(groups) as GlobalSearchGroup[])
                .filter((g) => groups[g].length > 0)
                .map((g) => (
                  <div key={g} className="mb-2">
                    <p className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {GROUP_LABELS[g]}
                    </p>
                    {groups[g].map((hit) => (
                      <button
                        key={hit.id}
                        onClick={() => go(hit.href)}
                        className="flex w-full flex-col items-start gap-0.5 rounded-md px-3 py-2 text-left hover:bg-secondary"
                      >
                        <span className="text-sm font-medium">{hit.title}</span>
                        {hit.description ? (
                          <span className="text-xs text-muted-foreground">
                            {truncate(hit.description, 120)}
                          </span>
                        ) : null}
                      </button>
                    ))}
                  </div>
                ))}
              <button
                onClick={submit}
                className="mt-1 flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-accent hover:bg-secondary"
              >
                <CornerDownLeft className="h-4 w-4" />
                See all results for “{q.trim()}”
              </button>
            </>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
