'use client';

import * as React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

export interface Term {
  id: string;
  slug: string;
  term: string;
  definition: string;
  plainLanguage: string | null;
  pronunciation: string | null;
  topic: { name: string; slug: string } | null;
}

const LETTERS = '#ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export function GlossaryBrowser({ terms }: { terms: Term[] }) {
  const [q, setQ] = React.useState('');
  const [letter, setLetter] = React.useState<string | null>(null);

  const filtered = terms.filter((t) => {
    const matchesQ =
      !q ||
      t.term.toLowerCase().includes(q.toLowerCase()) ||
      t.definition.toLowerCase().includes(q.toLowerCase());
    const first = t.term[0]?.toUpperCase() ?? '#';
    const matchesLetter =
      !letter || (letter === '#' ? !/[A-Z]/.test(first) : first === letter);
    return matchesQ && matchesLetter;
  });

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search terms and definitions…"
            className="pl-9"
            aria-label="Search glossary"
          />
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-1">
        <button
          onClick={() => setLetter(null)}
          className={`rounded px-2 py-1 text-xs font-medium ${
            letter === null ? 'bg-accent text-accent-foreground' : 'hover:bg-secondary'
          }`}
        >
          All
        </button>
        {LETTERS.map((l) => {
          const has = terms.some((t) => {
            const f = t.term[0]?.toUpperCase() ?? '#';
            return l === '#' ? !/[A-Z]/.test(f) : f === l;
          });
          return (
            <button
              key={l}
              disabled={!has}
              onClick={() => setLetter(l)}
              className={`rounded px-2 py-1 text-xs font-medium disabled:opacity-30 ${
                letter === l ? 'bg-accent text-accent-foreground' : 'hover:bg-secondary'
              }`}
            >
              {l}
            </button>
          );
        })}
      </div>

      <p className="mb-4 text-sm text-muted-foreground" aria-live="polite">
        {filtered.length} {filtered.length === 1 ? 'term' : 'terms'}
      </p>

      <dl className="space-y-4">
        {filtered.map((t) => (
          <div
            key={t.id}
            id={t.slug}
            className="scroll-mt-24 rounded-xl border border-border bg-card p-5"
          >
            <dt className="flex flex-wrap items-baseline gap-2">
              <span className="font-display text-lg font-semibold">{t.term}</span>
              {t.pronunciation ? (
                <span className="text-sm text-muted-foreground">/{t.pronunciation}/</span>
              ) : null}
              {t.topic ? (
                <a
                  href={`/explore/${t.topic.slug}`}
                  className="rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground hover:text-accent"
                >
                  {t.topic.name}
                </a>
              ) : null}
            </dt>
            <dd className="mt-2 text-sm leading-relaxed text-foreground/90">{t.definition}</dd>
            {t.plainLanguage ? (
              <dd className="mt-2 rounded-md bg-muted/50 p-2 text-sm text-muted-foreground">
                <strong>In plain language:</strong> {t.plainLanguage}
              </dd>
            ) : null}
          </div>
        ))}
        {filtered.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            No terms match your search.
          </p>
        ) : null}
      </dl>
    </div>
  );
}
