import * as React from 'react';
import Link from 'next/link';
import { AlertTriangle, ChevronRight, Compass } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('animate-pulse rounded-sm bg-surface-muted', className)}
      {...props}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="border border-border bg-surface p-1">
      <Skeleton className="aspect-[4/3] w-full" />
      <div className="p-4">
        <Skeleton className="mb-3 h-3 w-24" />
        <Skeleton className="mb-2 h-5 w-full" />
        <Skeleton className="h-5 w-2/3" />
      </div>
    </div>
  );
}

export function EmptyState({
  title,
  description,
  icon: Icon,
  action,
}: {
  title: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-start gap-4 border border-dashed border-border px-8 py-16 sm:py-24">
      {Icon ? <Icon className="h-6 w-6 text-muted-foreground" /> : null}
      <h3 className="display-3 uppercase tracking-tight">{title}</h3>
      {description ? (
        <p className="max-w-md text-sm text-muted-foreground">{description}</p>
      ) : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}

export function ErrorState({
  title = 'Something went off course.',
  description = 'The polar signal was lost. Please try again.',
  retry,
}: {
  title?: string;
  description?: string;
  retry?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-start gap-4 border border-destructive/40 bg-destructive/[0.04] px-8 py-16">
      <AlertTriangle className="h-6 w-6 text-destructive" />
      <h3 className="display-3 uppercase tracking-tight">{title}</h3>
      <p className="max-w-md text-sm text-muted-foreground">{description}</p>
      {retry ? <div className="mt-2">{retry}</div> : null}
    </div>
  );
}

export interface Crumb {
  label: string;
  href?: string;
}

export function Breadcrumb({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="metadata">
      <ol className="flex flex-wrap items-center gap-1.5">
        {items.map((c, i) => (
          <li key={`${c.label}-${i}`} className="flex items-center gap-1.5">
            {i > 0 ? <ChevronRight className="h-3 w-3 opacity-40" /> : null}
            {c.href && i < items.length - 1 ? (
              <Link href={c.href} className="transition-colors hover:text-foreground">
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

/** Legacy section heading used across content pages. Restyled editorially. */
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
    <div className={cn('mb-10 sm:mb-14', className)}>
      <div className="hairline" />
      <div className="mt-6 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div className="max-w-3xl">
          {eyebrow ? (
            <span className="eyebrow eyebrow-accent">
              <span className="h-px w-6 bg-current" aria-hidden />
              {eyebrow}
            </span>
          ) : null}
          <h2 className="display-2 mt-3 text-balance">{title}</h2>
          {description ? (
            <p className="mt-4 max-w-2xl text-muted-foreground">{description}</p>
          ) : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
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
  const rows: [string, string | null | undefined][] = [
    ['Source', source],
    ['Publisher', publisher],
    ['Last updated', lastUpdated],
    ['Version', version],
    ['Licence', license],
  ];
  return (
    <div className={cn('border border-border bg-surface-muted/60 p-4', className)}>
      <p className="metadata mb-3">Provenance</p>
      <dl className="grid gap-x-6 gap-y-1.5 text-xs sm:grid-cols-2">
        {rows
          .filter(([, v]) => v)
          .map(([k, v]) => (
            <div key={k} className="flex justify-between gap-3">
              <dt className="text-muted-foreground">{k}</dt>
              <dd className="text-right font-medium">{v}</dd>
            </div>
          ))}
      </dl>
      {methodology ? (
        <p className="mt-3 border-t border-border pt-3 text-xs text-muted-foreground">
          {methodology}
        </p>
      ) : null}
      {isDemo ? (
        <p className="mt-3 border border-dashed border-amber-500/50 bg-amber-500/[0.06] px-3 py-2 text-xs font-medium text-amber-600 dark:text-amber-300">
          Demo / sample dataset — illustrative values for interface demonstration. Not a
          scientific measurement; do not cite.
        </p>
      ) : null}
    </div>
  );
}
