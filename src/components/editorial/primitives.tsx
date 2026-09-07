import * as React from 'react';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Eyebrow({
  children,
  className,
  accent,
}: {
  children: React.ReactNode;
  className?: string;
  accent?: boolean;
}) {
  return (
    <span className={cn('eyebrow', accent && 'eyebrow-accent', className)}>
      {accent ? <span className="h-px w-6 bg-current" aria-hidden /> : null}
      {children}
    </span>
  );
}

export function Hairline({ className }: { className?: string }) {
  return <div className={cn('hairline', className)} role="presentation" />;
}

/**
 * Numbered editorial section heading — "01 / THE POLAR WORLD" style, with an
 * oversized title and optional lead + action.
 */
export function SectionHeading({
  index,
  kicker,
  title,
  lead,
  action,
  align = 'left',
  className,
}: {
  index?: string;
  kicker: string;
  title: React.ReactNode;
  lead?: React.ReactNode;
  action?: React.ReactNode;
  align?: 'left' | 'center';
  className?: string;
}) {
  return (
    <div
      className={cn(
        'mb-12 flex flex-col gap-6 sm:mb-16',
        align === 'center' && 'items-center text-center',
        className,
      )}
    >
      <Hairline />
      <div
        className={cn(
          'flex flex-col gap-6 md:flex-row md:items-end md:justify-between',
          align === 'center' && 'md:flex-col md:items-center',
        )}
      >
        <div className={cn('max-w-3xl', align === 'center' && 'mx-auto')}>
          <Eyebrow accent>
            {index ? <span className="tabular-nums">{index}</span> : null}
            {index ? <span className="opacity-40">/</span> : null}
            {kicker}
          </Eyebrow>
          <h2 className="display-2 mt-4 text-balance">{title}</h2>
          {lead ? <p className="editorial-lead mt-5">{lead}</p> : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
    </div>
  );
}

/** Text link with an animated underline + arrow. */
export function EditorialLink({
  href,
  children,
  external,
  className,
}: {
  href: string;
  children: React.ReactNode;
  external?: boolean;
  className?: string;
}) {
  const Icon = external ? ArrowUpRight : ArrowRight;
  const inner = (
    <span className="hover-arrow inline-flex items-center gap-2 text-sm font-medium uppercase tracking-[0.14em]">
      <span className="link-reveal">{children}</span>
      <Icon className="h-4 w-4" />
    </span>
  );
  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={cn('group', className)}>
        {inner}
      </a>
    );
  }
  return (
    <Link href={href} className={cn('group', className)}>
      {inner}
    </Link>
  );
}

/** Uppercase / tracked metadata row (e.g. "ANTARCTICA · 2026 · GLACIOLOGY"). */
export function MetaRow({
  items,
  className,
}: {
  items: (string | null | undefined)[];
  className?: string;
}) {
  const parts = items.filter(Boolean) as string[];
  return (
    <p className={cn('metadata flex flex-wrap items-center gap-x-3 gap-y-1', className)}>
      {parts.map((p, i) => (
        <React.Fragment key={`${p}-${i}`}>
          {i > 0 ? <span className="opacity-30" aria-hidden>—</span> : null}
          <span>{p}</span>
        </React.Fragment>
      ))}
    </p>
  );
}
