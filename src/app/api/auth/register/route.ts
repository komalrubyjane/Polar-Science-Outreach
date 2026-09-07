import { prisma } from '@/lib/db';
import { hashPassword } from '@/lib/auth/password';
import { registerSchema } from '@/lib/validation';
import { handle, created, badRequest, enforceRateLimit, readJson } from '@/lib/api';
import { recordAudit } from '@/lib/audit';
import { logger } from '@/lib/logger';

export const runtime = 'nodejs';

export const POST = handle(async (req) => {
  enforceRateLimit(req, 'auth-register', { max: 8 });

  const body = await readJson(req);
  const { name, email, password } = registerSchema.parse(body);
  const normalized = email.toLowerCase();

  const existing = await prisma.user.findUnique({ where: { email: normalized } });
  if (existing) {
    // Do not reveal which emails are registered.
    badRequest('If that email can be registered, you will be able to sign in.');
  }

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: { name, email: normalized, passwordHash, role: 'USER' },
    select: { id: true, email: true, name: true, role: true },
  });

  await recordAudit({
    action: 'user.register',
    entityType: 'User',
    entityId: user.id,
    actorId: user.id,
    req,
  });
  logger.info('New user registered', { userId: user.id });

  return created({ id: user.id, email: user.email });
});
