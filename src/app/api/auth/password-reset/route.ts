import crypto from 'node:crypto';
import { prisma } from '@/lib/db';
import { handle, ok, badRequest, readJson, enforceRateLimit } from '@/lib/api';
import { passwordResetRequestSchema, passwordResetSchema } from '@/lib/validation';
import { hashPassword } from '@/lib/auth/password';
import { sendEmail } from '@/lib/notifications';
import { env } from '@/lib/env';
import { recordAudit } from '@/lib/audit';

export const runtime = 'nodejs';

/** Request a reset link. Always returns 200 to avoid account enumeration. */
export const POST = handle(async (req) => {
  enforceRateLimit(req, 'pw-reset-request', { max: 6 });
  const { email } = passwordResetRequestSchema.parse(await readJson(req));
  const normalized = email.toLowerCase();
  const user = await prisma.user.findUnique({ where: { email: normalized } });

  if (user) {
    const token = crypto.randomBytes(32).toString('hex');
    await prisma.passwordResetToken.create({
      data: { email: normalized, token, expires: new Date(Date.now() + 60 * 60 * 1000) },
    });
    await sendEmail({
      to: normalized,
      subject: 'Reset your Polar Science Portal password',
      text: `Use this link within one hour to reset your password:\n${env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}\n\nIf you did not request this, no action is needed.`,
    });
  }
  return ok({ status: 'sent' });
});

/** Complete the reset with a valid token. */
export const PUT = handle(async (req) => {
  enforceRateLimit(req, 'pw-reset-complete', { max: 12 });
  const { token, password } = passwordResetSchema.parse(await readJson(req));

  const record = await prisma.passwordResetToken.findUnique({ where: { token } });
  if (!record || record.expires < new Date()) badRequest('This reset link is invalid or has expired');

  const user = await prisma.user.findUnique({ where: { email: record!.email } });
  if (!user) badRequest('This reset link is invalid or has expired');

  await prisma.$transaction([
    prisma.user.update({
      where: { id: user!.id },
      data: { passwordHash: await hashPassword(password), mustChangePassword: false },
    }),
    prisma.passwordResetToken.deleteMany({ where: { email: record!.email } }),
  ]);

  await recordAudit({
    actorId: user!.id,
    action: 'user.password_reset',
    entityType: 'User',
    entityId: user!.id,
    req,
  });
  return ok({ status: 'reset' });
});
