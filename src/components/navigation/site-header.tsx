'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Snowflake, ChevronDown } from 'lucide-react';
import { PRIMARY_NAV, SITE } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { GlobalSearch } from '@/components/search/global-search';
import { ThemeToggle } from '@/components/theme-toggle';
import { LanguageSelector } from '@/components/language-selector';
import { UserMenu } from '@/components/navigation/user-menu';
import { MobileNav } from '@/components/navigation/mobile-nav';

export function SiteHeader() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={cn(
        'sticky top-0 z-40 w-full border-b border-border/80 bg-background/85 backdrop-blur transition-shadow',
        scrolled && 'shadow-sm',
      )}
    >
      <div className="container-page flex h-16 items-center gap-3">
        <MobileNav />

        <Link href="/" className="flex items-center gap-2">
          <Snowflake className="h-6 w-6 text-accent" />
          <span className="font-display text-base font-semibold tracking-tight">
            {SITE.name}
          </span>
        </Link>

        <nav className="ml-4 hidden items-center gap-0.5 lg:flex" aria-label="Primary">
          {PRIMARY_NAV.slice(0, 6).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'rounded-md px-2.5 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-secondary hover:text-foreground',
                pathname.startsWith(item.href) && 'text-accent',
              )}
            >
              {item.label}
            </Link>
          ))}
          <div className="group relative">
            <button className="flex items-center gap-1 rounded-md px-2.5 py-2 text-sm font-medium text-foreground/80 hover:bg-secondary hover:text-foreground">
              More <ChevronDown className="h-3.5 w-3.5" />
            </button>
            <div className="invisible absolute left-0 top-full w-64 rounded-lg border border-border bg-popover p-2 opacity-0 shadow-lg transition-all group-hover:visible group-hover:opacity-100">
              {[...PRIMARY_NAV.slice(6), { label: 'Polar Map', href: '/map' }, { label: 'Glossary', href: '/glossary' }, { label: 'Researchers', href: '/researchers' }, { label: 'Institutions', href: '/institutions' }].map(
                (item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="block rounded-md px-3 py-2 text-sm hover:bg-secondary"
                  >
                    {item.label}
                  </Link>
                ),
              )}
            </div>
          </div>
        </nav>

        <div className="ml-auto flex items-center gap-1.5">
          <GlobalSearch />
          <LanguageSelector />
          <ThemeToggle />
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
