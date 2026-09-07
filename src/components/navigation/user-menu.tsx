'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import {
  LogOut,
  User as UserIcon,
  Bookmark,
  LayoutDashboard,
  FileUp,
  ClipboardCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { can } from '@/lib/rbac';

export function UserMenu() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <div className="h-9 w-20 animate-pulse rounded-md bg-muted" />;
  }

  if (!session?.user) {
    return (
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost" size="sm">
          <Link href="/login">Log in</Link>
        </Button>
        <Button asChild size="sm" className="hidden sm:inline-flex">
          <Link href="/register">Sign up</Link>
        </Button>
      </div>
    );
  }

  const { name, email, role } = session.user;
  const initials = (name ?? email ?? '?')
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground"
          aria-label="Open account menu"
        >
          {initials}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col">
            <span className="truncate font-medium text-foreground">{name ?? 'Account'}</span>
            <span className="truncate text-xs font-normal text-muted-foreground">{email}</span>
            <span className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-accent">
              {role}
            </span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/profile">
            <UserIcon /> Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/bookmarks">
            <Bookmark /> Bookmarks
          </Link>
        </DropdownMenuItem>
        {can(role, 'content:submit') ? (
          <DropdownMenuItem asChild>
            <Link href="/submit">
              <FileUp /> Submit content
            </Link>
          </DropdownMenuItem>
        ) : null}
        {can(role, 'content:review') ? (
          <DropdownMenuItem asChild>
            <Link href="/admin/submissions">
              <ClipboardCheck /> Review queue
            </Link>
          </DropdownMenuItem>
        ) : null}
        {can(role, 'admin:access') ? (
          <DropdownMenuItem asChild>
            <Link href="/admin">
              <LayoutDashboard /> Admin dashboard
            </Link>
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => signOut({ callbackUrl: '/' })}>
          <LogOut /> Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
