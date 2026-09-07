'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ClipboardCheck,
  Users,
  ScrollText,
  BarChart3,
  Boxes,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const ITEMS = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, staffOnly: false },
  { href: '/admin/submissions', label: 'Review queue', icon: ClipboardCheck, staffOnly: false },
  { href: '/admin/content', label: 'Content', icon: Boxes, staffOnly: false },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart3, staffOnly: false },
  { href: '/admin/users', label: 'Users', icon: Users, adminOnly: true },
  { href: '/admin/audit', label: 'Audit log', icon: ScrollText, adminOnly: true },
];

export function AdminNav({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();
  return (
    <nav className="space-y-1">
      {ITEMS.filter((i) => !i.adminOnly || isAdmin).map((item) => {
        const active = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
              active
                ? 'bg-accent/10 text-accent'
                : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
