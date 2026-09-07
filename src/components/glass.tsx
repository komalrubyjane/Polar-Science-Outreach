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
