import { prisma } from '@/lib/db';
import { handle, paginated, created, readJson } from '@/lib/api';
import { requirePermission } from '@/lib/auth/session';
import { adminUserCreateSchema } from '@/lib/validation';
import { hashPassword } from '@/lib/auth/password';
import { pageArgs, textWhere } from '@/lib/services/list-helpers';
import { recordAudit } from '@/lib/audit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = handle(async (req) => {
  await requirePermission('user:manage');
  const p = new URL(req.url).searchParams;
  const { skip, take, page, pageSize } = pageArgs(Number(p.get('page') ?? 1), Number(p.get('pageSize') ?? 20));
  const where = {
    ...(p.get('role') ? { role: p.get('role') as never } : {}),
    ...(textWhere(p.get('q'), ['name', 'email', 'organization']) ?? {}),
  };
  const [items, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, name: true, email: true, role: true, organization: true,
        emailVerified: true, createdAt: true, mustChangePassword: true,
        _count: { select: { bookmarks: true, submissions: true } },
      },
    }),
    prisma.user.count({ where }),
  ]);
  return paginated(items, { total, page, pageSize });
});

export const POST = handle(async (req) => {
  const admin = await requirePermission('user:manage');
  const input = adminUserCreateSchema.parse(await readJson(req));
  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email.toLowerCase(),
      role: input.role,
      passwordHash: await hashPassword(input.password),
      mustChangePassword: true,
    },
    select: { id: true, email: true, role: true },
  });
  await recordAudit({
    actorId: admin.id,
    action: 'user.create',
    entityType: 'User',
    entityId: user.id,
    metadata: { role: user.role },
    req,
  });
  return created(user);
});
