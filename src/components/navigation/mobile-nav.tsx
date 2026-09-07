'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Snowflake } from 'lucide-react';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { PRIMARY_NAV, SITE } from '@/lib/constants';
import { cn } from '@/lib/utils';

export function MobileNav() {
  const [open, setOpen] = React.useState(false);
  const pathname = usePathname();

  React.useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open navigation menu">
          <Menu className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="left-0 top-0 h-dvh max-w-xs translate-x-0 translate-y-0 rounded-none border-y-0 border-l-0 data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-display font-semibold">
            <Snowflake className="h-5 w-5 text-accent" />
            {SITE.name}
          </Link>
          <Button variant="ghost" size="icon" onClick={() => setOpen(false)} aria-label="Close menu">
            <X className="h-5 w-5" />
          </Button>
        </div>
        <nav className="mt-4 flex flex-col gap-1">
          <Link
            href="/"
            className={cn(
              'rounded-md px-3 py-2 text-sm font-medium hover:bg-secondary',
              pathname === '/' && 'bg-secondary text-accent',
            )}
          >
            Home
          </Link>
          {PRIMARY_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'rounded-md px-3 py-2 text-sm font-medium hover:bg-secondary',
                pathname.startsWith(item.href) && 'bg-secondary text-accent',
              )}
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/map"
            className="rounded-md px-3 py-2 text-sm font-medium hover:bg-secondary"
          >
            Polar Map
          </Link>
          <Link
            href="/glossary"
            className="rounded-md px-3 py-2 text-sm font-medium hover:bg-secondary"
          >
            Glossary
          </Link>
        </nav>
      </DialogContent>
    </Dialog>
  );
}
