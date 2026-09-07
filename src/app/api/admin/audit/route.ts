import { prisma } from '@/lib/db';
import { handle, paginated } from '@/lib/api';
import { requirePermission } from '@/lib/auth/session';
import { pageArgs } from '@/lib/services/list-helpers';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = handle(async (req) => {
  await requirePermission('audit:read');
  const p = new URL(req.url).searchParams;
  const { skip, take, page, pageSize } = pageArgs(Number(p.get('page') ?? 1), Number(p.get('pageSize') ?? 30));
  const where = {
    ...(p.get('action') ? { action: { contains: p.get('action')!, mode: 'insensitive' as const } } : {}),
    ...(p.get('entityType') ? { entityType: p.get('entityType')! } : {}),
  };
  const [items, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: { actor: { select: { name: true, email: true } } },
    }),
    prisma.auditLog.count({ where }),
  ]);
  return paginated(items, { total, page, pageSize });
});
