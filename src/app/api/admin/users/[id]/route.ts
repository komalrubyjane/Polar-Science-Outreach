import { prisma } from '@/lib/db';
import { handle, ok, fail, readJson, badRequest } from '@/lib/api';
import { requirePermission } from '@/lib/auth/session';
import { userRoleUpdateSchema } from '@/lib/validation';
import { recordAudit } from '@/lib/audit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const PATCH = handle(async (req, ctx) => {
  const { id } = await ctx.params;
  const admin = await requirePermission('user:manage');
  const { role } = userRoleUpdateSchema.parse(await readJson(req));

  const target = await prisma.user.findUnique({ where: { id }, select: { id: true, role: true } });
  if (!target) return fail(404, 'User not found');
  if (target.id === admin.id) badRequest('You cannot change your own role');

  if (target.role === 'ADMIN' && role !== 'ADMIN') {
    const admins = await prisma.user.count({ where: { role: 'ADMIN' } });
    if (admins <= 1) badRequest('At least one administrator must remain');
  }

  const updated = await prisma.user.update({
    where: { id },
    data: { role },
    select: { id: true, role: true, email: true },
  });
  await recordAudit({
    actorId: admin.id,
    action: 'user.role_change',
    entityType: 'User',
    entityId: id,
    metadata: { from: target.role, to: role },
    req,
  });
  return ok(updated);
});

export const DELETE = handle(async (req, ctx) => {
  const { id } = await ctx.params;
  const admin = await requirePermission('user:manage');
  if (id === admin.id) badRequest('You cannot delete your own account here');

  const target = await prisma.user.findUnique({ where: { id }, select: { role: true, email: true } });
  if (!target) return fail(404, 'User not found');
  if (target.role === 'ADMIN') {
    const admins = await prisma.user.count({ where: { role: 'ADMIN' } });
    if (admins <= 1) badRequest('At least one administrator must remain');
  }

  await prisma.user.delete({ where: { id } });
  await recordAudit({
    actorId: admin.id,
    action: 'user.delete',
    entityType: 'User',
    entityId: id,
    metadata: { email: target.email },
    req,
  });
  return ok({ deleted: true });
});
