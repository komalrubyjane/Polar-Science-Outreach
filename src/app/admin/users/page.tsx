import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { safe } from '@/lib/safe';
import { getCurrentUser } from '@/lib/auth/session';
import { UsersTable } from '@/components/admin/users-table';

export const metadata: Metadata = { title: 'User management' };
export const dynamic = 'force-dynamic';

export default async function AdminUsersPage() {
  const me = await getCurrentUser();
  if (!me || me.role !== 'ADMIN') redirect('/403');

  const users = await safe(
    () =>
      prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        take: 200,
        select: {
          id: true, name: true, email: true, role: true, organization: true,
          emailVerified: true, createdAt: true,
          _count: { select: { submissions: true, bookmarks: true } },
        },
      }),
    [],
    'adminUsers',
  );

  return (
    <div>
      <h1 className="mb-1 font-display text-2xl font-semibold">Users</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Change roles or remove accounts. At least one administrator must always remain. You
        cannot change your own role here.
      </p>
      <UsersTable
        currentUserId={me.id}
        initial={users.map((u) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.role,
          organization: u.organization,
          verified: Boolean(u.emailVerified),
          createdAt: u.createdAt.toISOString(),
          submissions: u._count.submissions,
          bookmarks: u._count.bookmarks,
        }))}
      />
    </div>
  );
}
