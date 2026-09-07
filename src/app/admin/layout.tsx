import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/session';
import { can } from '@/lib/rbac';
import { AdminNav } from '@/components/admin/admin-nav';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect('/login?callbackUrl=/admin');
  if (!can(user.role, 'admin:access')) redirect('/403');

  const isAdmin = user.role === 'ADMIN';

  return (
    <div className="container-page py-8">
      <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
        <aside>
          <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Administration
          </p>
          <AdminNav isAdmin={isAdmin} />
          <p className="mt-4 px-3 text-[11px] text-muted-foreground">
            Signed in as {user.email} · {user.role}
          </p>
        </aside>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
