import * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * Glass surfaces. Used strategically — navbar (scrolled), floating panels over
 * imagery, filters, map / media controls, modals. Not everywhere.
 */

export function GlassPanel({
  className,
  tone = 'light',
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { tone?: 'light' | 'dark' }) {
  return (
    <div
      className={cn(
        tone === 'dark' ? 'glass-dark' : 'glass',
        'rounded-card',
        className,
      )}
      {...props}
    />
  );
}

export function GlassCard({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'glass rounded-card-lg p-6 transition-transform duration-300 ease-editorial hover:-translate-y-1',
        className,
      )}
      {...props}
    />
  );
}

/** Small floating glass stat panel (hero / data page). */
export function FloatingStat({
  label,
  value,
  sub,
  className,
  float = true,
}: {
  label: string;
  value: React.ReactNode;
  sub?: string;
  className?: string;
  float?: boolean;
}) {
  return (
    <div
      className={cn(
        'glass-dark rounded-2xl px-4 py-3 text-white',
        float && 'float-slow',
        className,
      )}
    >
      <p className="text-[0.62rem] font-medium uppercase tracking-[0.18em] text-white/60">
        {label}
      </p>
      <p className="mt-1 font-display text-xl font-medium leading-none">{value}</p>
      {sub ? <p className="mt-1 text-[0.7rem] text-white/55">{sub}</p> : null}
    </div>
  );
}

/** Small glass pill naming the authoritative data source. */
export function SourceBadge({
  source,
  className,
  tone = 'auto',
}: {
  source: string;
  className?: string;
  tone?: 'auto' | 'light' | 'dark';
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.62rem] font-medium uppercase tracking-[0.14em]',
        tone === 'dark'
          ? 'glass-dark text-white'
          : tone === 'light'
            ? 'glass text-foreground'
            : 'border border-border bg-surface/70 text-muted-foreground',
        className,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden />
      {source}
    </span>
  );
}

/** "LIVE" / "Updated 3h ago" freshness indicator from a real timestamp. */
export function DataFreshness({
  lastUpdated,
  className,
}: {
  lastUpdated: string | null | undefined;
  className?: string;
}) {
  if (!lastUpdated) {
    return (
      <span className={cn('metadata text-muted-foreground', className)}>Updated — unknown</span>
    );
  }
  const d = new Date(lastUpdated);
  const valid = !Number.isNaN(d.getTime());
  const ageH = valid ? (Date.now() - d.getTime()) / 3_600_000 : Infinity;
  const label = !valid
    ? `Updated ${lastUpdated}`
    : ageH < 3
      ? 'Live'
      : ageH < 48
        ? `Updated ${Math.round(ageH)}h ago`
        : `Updated ${d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 text-[0.62rem] font-medium uppercase tracking-[0.14em]',
        ageH < 3 ? 'text-success' : 'text-muted-foreground',
        className,
      )}
    >
      {ageH < 3 ? (
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-success" aria-hidden />
      ) : null}
      {label}
    </span>
  );
}

/** Unobtrusive image attribution. */
export function ImageCredit({
  credit,
  href,
  className,
}: {
  credit: string;
  href?: string;
  className?: string;
}) {
  if (!credit) return null;
  const body = <span>Photo — {credit}</span>;
  return (
    <p
      className={cn(
        'text-[0.62rem] font-medium uppercase tracking-[0.14em] text-white/50',
        className,
      )}
    >
      {href ? (
        <a href={href} target="_blank" rel="noopener noreferrer" className="hover:text-white/80">
          {body}
        </a>
      ) : (
        body
      )}
    </p>
  );
}
