'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { EDITORIAL_NAV, EDITORIAL_NAV_MORE } from '@/lib/constants';
import { cn } from '@/lib/utils';

export function MobileNav() {
  const [open, setOpen] = React.useState(false);
  const pathname = usePathname();

  React.useEffect(() => {
    setOpen(false);
  }, [pathname]);

  React.useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        aria-expanded={open}
        className="inline-flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-current/10 lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div
        className={cn(
          'fixed inset-0 z-[60] bg-polar-snow text-polar-navy transition-[opacity,visibility] duration-500 ease-editorial lg:hidden',
          open ? 'visible opacity-100' : 'invisible opacity-0',
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Site navigation"
      >
        <div className="grain absolute inset-0 -z-10 aurora-bg opacity-60" aria-hidden />
        <div className="editorial flex h-[var(--header-h)] items-center justify-between">
          <span className="font-display text-[0.95rem] font-medium uppercase tracking-[0.18em]">
            Polar Science
          </span>
          <button
            onClick={() => setOpen(false)}
            aria-label="Close menu"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-polar-navy/10"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="editorial mt-6 flex flex-col">
          {[{ label: 'Home', href: '/' }, ...EDITORIAL_NAV].map((item, i) => {
            const active =
              item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-baseline gap-4 border-b border-polar-navy/10 py-5 transition-colors',
                  active ? 'text-polar-navy' : 'text-polar-navy/60 hover:text-polar-navy',
                )}
                style={{
                  transitionDelay: open ? `${80 + i * 45}ms` : '0ms',
                  opacity: open ? 1 : 0,
                  transform: open ? 'none' : 'translateY(12px)',
                  transitionProperty: 'opacity, transform, color',
                  transitionDuration: '500ms',
                  transitionTimingFunction: 'cubic-bezier(0.22,1,0.36,1)',
                }}
              >
                <span className="metadata text-polar-navy/40">
                  {String(i).padStart(2, '0')}
                </span>
                <span className="display-3 font-display">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="editorial mt-8 flex flex-wrap gap-x-6 gap-y-2">
          {EDITORIAL_NAV_MORE.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="metadata text-polar-navy/60 transition-colors hover:text-polar-navy"
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="editorial mt-10 flex gap-4">
          <Link
            href="/login"
            className="metadata border border-polar-navy/25 px-5 py-3 transition-colors hover:bg-polar-navy hover:text-white"
          >
            Log in
          </Link>
          <Link
            href="/bookmarks"
            className="metadata border border-polar-navy/25 px-5 py-3 transition-colors hover:bg-polar-navy hover:text-white"
          >
            Bookmarks
          </Link>
        </div>
      </div>
    </>
  );
}
