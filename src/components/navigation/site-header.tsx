'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Plus, Bookmark } from 'lucide-react';
import { EDITORIAL_NAV, EDITORIAL_NAV_MORE } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { GlobalSearch } from '@/components/search/global-search';
import { ThemeToggle } from '@/components/theme-toggle';
import { LanguageSelector } from '@/components/language-selector';
import { UserMenu } from '@/components/navigation/user-menu';
import { MobileNav } from '@/components/navigation/mobile-nav';

export function SiteHeader() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = React.useState(false);
  const [overHero, setOverHero] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Transparent while a page's cinematic hero sentinel is still on screen.
  React.useEffect(() => {
    setOverHero(false);
    const el = document.getElementById('site-hero-sentinel');
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const obs = new IntersectionObserver(
      ([entry]) => setOverHero(Boolean(entry?.isIntersecting)),
      { rootMargin: '-4px 0px 0px 0px' },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [pathname]);

  const transparent = overHero && !scrolled;
  const glassDark = overHero && scrolled; // scrolled past a cinematic hero

  return (
    <header
      data-transparent={transparent}
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,height,color,box-shadow] duration-500 ease-editorial',
        transparent && 'border-b border-transparent bg-transparent text-white',
        glassDark &&
          'border-b border-white/12 bg-[rgb(7_31_50_/_0.55)] text-white shadow-[0_10px_40px_rgb(7_31_50_/_0.18)] [backdrop-filter:blur(20px)_saturate(140%)]',
        !transparent &&
          !glassDark &&
          'border-b border-border bg-[rgb(var(--surface)_/_0.7)] text-foreground shadow-[0_10px_40px_rgb(7_31_50_/_0.08)] [backdrop-filter:blur(20px)_saturate(140%)]',
      )}
      style={{ ['--_h' as string]: scrolled ? '4.25rem' : '5.25rem' }}
    >
      <div
        className="editorial flex items-center justify-between gap-6"
        style={{ height: 'var(--_h)' }}
      >
        {/* Wordmark */}
        <Link href="/" className="group flex shrink-0 items-center gap-3" aria-label="Polar Science Portal — home">
          <span className="grid h-8 w-8 place-items-center border border-current/40">
            <span className="block h-1.5 w-1.5 rounded-full bg-current transition-transform duration-500 group-hover:scale-150" />
          </span>
          <span className="hidden font-display text-[0.95rem] font-medium uppercase leading-[1.05] tracking-[0.18em] sm:block">
            Polar
            <br />
            Science
          </span>
        </Link>

        {/* Primary nav */}
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
          {EDITORIAL_NAV.map((item) => {
            const active =
              item.href === '/'
                ? pathname === '/'
                : pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'relative px-3 py-2 text-xs font-medium uppercase tracking-[0.16em] transition-opacity',
                  active ? 'opacity-100' : 'opacity-60 hover:opacity-100',
                )}
              >
                {item.label}
                <span
                  className={cn(
                    'absolute inset-x-3 bottom-1 h-px origin-left bg-current transition-transform duration-500 ease-editorial',
                    active ? 'scale-x-100' : 'scale-x-0',
                  )}
                />
              </Link>
            );
          })}
          <div className="group relative">
            <button className="flex items-center gap-1 px-3 py-2 text-xs font-medium uppercase tracking-[0.16em] opacity-60 transition-opacity hover:opacity-100">
              More <Plus className="h-3 w-3" />
            </button>
            <div className="invisible absolute right-0 top-full w-56 border border-border bg-popover p-1.5 text-foreground opacity-0 shadow-2xl transition-all duration-300 group-hover:visible group-hover:opacity-100">
              {EDITORIAL_NAV_MORE.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block px-3 py-2 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </nav>

        {/* Actions */}
        <div className="flex shrink-0 items-center gap-0.5">
          <GlobalSearch variant="icon" />
          <Link
            href="/bookmarks"
            aria-label="Bookmarks"
            className="hidden h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-current/10 sm:inline-flex"
          >
            <Bookmark className="h-[1.1rem] w-[1.1rem]" />
          </Link>
          <span className="hidden sm:inline-flex">
            <LanguageSelector />
          </span>
          <ThemeToggle />
          <span className="hidden sm:inline-flex">
            <UserMenu />
          </span>
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
