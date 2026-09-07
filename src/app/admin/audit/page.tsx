import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { safe } from '@/lib/safe';
import { getCurrentUser } from '@/lib/auth/session';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { EmptyState } from '@/components/ui/misc';
import { formatDateTime } from '@/lib/utils';

export const metadata: Metadata = { title: 'Audit log' };
export const dynamic = 'force-dynamic';

export default async function AdminAuditPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const me = await getCurrentUser();
  if (!me || me.role !== 'ADMIN') redirect('/403');

  const page = Math.max(1, Number((await searchParams).page ?? '1') || 1);
  const pageSize = 50;

  const [logs, total] = await Promise.all([
    safe(
      () =>
        prisma.auditLog.findMany({
          orderBy: { createdAt: 'desc' },
          skip: (page - 1) * pageSize,
          take: pageSize,
          include: { actor: { select: { name: true, email: true } } },
        }),
      [],
      'auditLogs',
    ),
    safe(() => prisma.auditLog.count(), 0, 'auditCount'),
  ]);

  const pageCount = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div>
      <h1 className="mb-1 font-display text-2xl font-semibold">Audit log</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        {total} recorded actions. IP addresses are stored only as keyed hashes.
      </p>
      {logs.length ? (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>When</TableHead>
                <TableHead>Actor</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Entity</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((l) => (
                <TableRow key={l.id}>
                  <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                    {formatDateTime(l.createdAt)}
                  </TableCell>
                  <TableCell className="text-sm">
                    {l.actor?.name ?? l.actor?.email ?? 'system'}
                  </TableCell>
                  <TableCell>
                    <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{l.action}</code>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {l.entityType}
                    {l.entityId ? `:${l.entityId.slice(0, 8)}` : ''}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {pageCount > 1 ? (
            <div className="mt-4 flex justify-center gap-2 text-sm">
              {page > 1 ? (
                <a href={`/admin/audit?page=${page - 1}`} className="text-accent hover:underline">
                  ← Previous
                </a>
              ) : null}
              <span className="text-muted-foreground">
                Page {page} of {pageCount}
              </span>
              {page < pageCount ? (
                <a href={`/admin/audit?page=${page + 1}`} className="text-accent hover:underline">
                  Next →
                </a>
              ) : null}
            </div>
          ) : null}
        </>
      ) : (
        <EmptyState title="No audit entries yet" description="Administrative actions will appear here." />
      )}
    </div>
  );
}
