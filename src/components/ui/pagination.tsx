'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { buttonVariants } from './button';

export function Pagination({
  page,
  pageCount,
  className,
}: {
  page: number;
  pageCount: number;
  className?: string;
}) {
  const pathname = usePathname();
  const params = useSearchParams();

  if (pageCount <= 1) return null;

  const hrefFor = (p: number) => {
    const sp = new URLSearchParams(params.toString());
    sp.set('page', String(p));
    return `${pathname}?${sp.toString()}`;
  };

  const pages = pageWindow(page, pageCount);

  return (
    <nav
      aria-label="Pagination"
      className={cn('mt-8 flex items-center justify-center gap-1', className)}
    >
      <Link
        href={hrefFor(Math.max(1, page - 1))}
        aria-disabled={page <= 1}
        className={cn(
          buttonVariants({ variant: 'outline', size: 'icon' }),
          page <= 1 && 'pointer-events-none opacity-50',
        )}
        aria-label="Previous page"
      >
        <ChevronLeft className="h-4 w-4" />
      </Link>

      {pages.map((p, i) =>
        p === '…' ? (
          <span key={`gap-${i}`} className="px-2 text-muted-foreground">
            …
          </span>
        ) : (
          <Link
            key={p}
            href={hrefFor(p)}
            aria-current={p === page ? 'page' : undefined}
            className={cn(
              buttonVariants({ variant: p === page ? 'default' : 'outline', size: 'icon' }),
            )}
          >
            {p}
          </Link>
        ),
      )}

      <Link
        href={hrefFor(Math.min(pageCount, page + 1))}
        aria-disabled={page >= pageCount}
        className={cn(
          buttonVariants({ variant: 'outline', size: 'icon' }),
          page >= pageCount && 'pointer-events-none opacity-50',
        )}
        aria-label="Next page"
      >
        <ChevronRight className="h-4 w-4" />
      </Link>
    </nav>
  );
}

function pageWindow(current: number, total: number): (number | '…')[] {
  const out: (number | '…')[] = [];
  const add = (n: number) => out.push(n);
  const span = 1;
  const left = Math.max(2, current - span);
  const right = Math.min(total - 1, current + span);
  add(1);
  if (left > 2) out.push('…');
  for (let i = left; i <= right; i++) add(i);
  if (right < total - 1) out.push('…');
  if (total > 1) add(total);
  return out;
}
