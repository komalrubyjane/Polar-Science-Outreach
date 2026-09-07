import { prisma } from '@/lib/db';
import { handle, ok, badRequest, readJson, enforceRateLimit } from '@/lib/api';
import { requireUser } from '@/lib/auth/session';
import { changePasswordSchema } from '@/lib/validation';
import { hashPassword, verifyPassword } from '@/lib/auth/password';
import { recordAudit } from '@/lib/audit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const PUT = handle(async (req) => {
  const session = await requireUser();
  enforceRateLimit(req, `pw-change:${session.id}`, { max: 10 });
  const { currentPassword, newPassword } = changePasswordSchema.parse(await readJson(req));

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    select: { passwordHash: true },
  });
  if (!user?.passwordHash) {
    badRequest('This account signs in with an external provider and has no password');
  }
  const okCurrent = await verifyPassword(currentPassword, user!.passwordHash!);
  if (!okCurrent) badRequest('Current password is incorrect');

  await prisma.user.update({
    where: { id: session.id },
    data: { passwordHash: await hashPassword(newPassword), mustChangePassword: false },
  });
  await recordAudit({
    actorId: session.id,
    action: 'user.password_change',
    entityType: 'User',
    entityId: session.id,
    req,
  });
  return ok({ changed: true });
});
