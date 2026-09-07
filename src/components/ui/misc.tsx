import * as React from 'react';
import Link from 'next/link';
import { AlertTriangle, Inbox, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('animate-pulse rounded-md bg-muted', className)} {...props} />;
}

export function CardSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <Skeleton className="mb-3 h-4 w-20" />
      <Skeleton className="mb-2 h-5 w-full" />
      <Skeleton className="mb-4 h-5 w-3/4" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="mt-2 h-3 w-2/3" />
    </div>
  );
}

export function EmptyState({
  title,
  description,
  icon: Icon = Inbox,
  action,
}: {
  title: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/50 px-6 py-16 text-center">
      <Icon className="mb-4 h-10 w-10 text-muted-foreground" />
      <h3 className="font-display text-lg font-semibold">{title}</h3>
      {description ? (
        <p className="mt-1 max-w-md text-sm text-muted-foreground">{description}</p>
      ) : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function ErrorState({
  title = 'Something went wrong',
  description = 'The content could not be loaded. Please try again.',
  retry,
}: {
  title?: string;
  description?: string;
  retry?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-destructive/40 bg-destructive/5 px-6 py-14 text-center">
      <AlertTriangle className="mb-4 h-10 w-10 text-destructive" />
      <h3 className="font-display text-lg font-semibold">{title}</h3>
      <p className="mt-1 max-w-md text-sm text-muted-foreground">{description}</p>
      {retry ? <div className="mt-5">{retry}</div> : null}
    </div>
  );
}

export interface Crumb {
  label: string;
  href?: string;
}

export function Breadcrumb({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-6 text-sm text-muted-foreground">
      <ol className="flex flex-wrap items-center gap-1">
        {items.map((c, i) => (
          <li key={`${c.label}-${i}`} className="flex items-center gap-1">
            {i > 0 ? <ChevronRight className="h-3.5 w-3.5 opacity-60" /> : null}
            {c.href && i < items.length - 1 ? (
              <Link href={c.href} className="hover:text-foreground hover:underline">
                {c.label}
              </Link>
            ) : (
              <span className={i === items.length - 1 ? 'text-foreground' : undefined}>
                {c.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('mb-6 flex flex-wrap items-end justify-between gap-4', className)}>
      <div>
        {eyebrow ? (
          <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-accent">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h2>
        {description ? (
          <p className="mt-2 max-w-2xl text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

/**
 * Provenance strip shown wherever scientific data is displayed. Makes clear the
 * portal is a dissemination platform, not necessarily the data producer.
 */
export function DataProvenance({
  source,
  publisher,
  lastUpdated,
  license,
  version,
  methodology,
  isDemo,
  className,
}: {
  source: string;
  publisher?: string | null;
  lastUpdated?: string | null;
  license?: string | null;
  version?: string | null;
  methodology?: string | null;
  isDemo?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'rounded-lg border border-border bg-muted/40 p-3 text-xs text-muted-foreground',
        className,
      )}
    >
      <dl className="grid gap-x-6 gap-y-1 sm:grid-cols-2">
        <div className="flex gap-1">
          <dt className="font-semibold text-foreground">Source:</dt>
          <dd>{source}</dd>
        </div>
        {publisher ? (
          <div className="flex gap-1">
            <dt className="font-semibold text-foreground">Publisher:</dt>
            <dd>{publisher}</dd>
          </div>
        ) : null}
        {lastUpdated ? (
          <div className="flex gap-1">
            <dt className="font-semibold text-foreground">Last updated:</dt>
            <dd>{lastUpdated}</dd>
          </div>
        ) : null}
        {version ? (
          <div className="flex gap-1">
            <dt className="font-semibold text-foreground">Version:</dt>
            <dd>{version}</dd>
          </div>
        ) : null}
        {license ? (
          <div className="flex gap-1">
            <dt className="font-semibold text-foreground">License:</dt>
            <dd>{license}</dd>
          </div>
        ) : null}
      </dl>
      {methodology ? <p className="mt-2 border-t border-border pt-2">{methodology}</p> : null}
      {isDemo ? (
        <p className="mt-2 rounded border border-dashed border-amber-500/60 bg-amber-500/10 px-2 py-1 font-medium text-amber-700 dark:text-amber-300">
          Demo / sample dataset — illustrative values for interface demonstration. Not a
          scientific measurement; do not cite.
        </p>
      ) : null}
    </div>
  );
}
