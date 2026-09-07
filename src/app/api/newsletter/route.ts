import crypto from 'node:crypto';
import { prisma } from '@/lib/db';
import { handle, ok, enforceRateLimit, readJson } from '@/lib/api';
import { newsletterSubscribeSchema } from '@/lib/validation';
import { sendEmail } from '@/lib/notifications';
import { env } from '@/lib/env';

export const runtime = 'nodejs';

export const POST = handle(async (req) => {
  enforceRateLimit(req, 'newsletter', { max: 10 });
  const { email, source } = newsletterSubscribeSchema.parse(await readJson(req));
  const normalized = email.toLowerCase();
  const token = crypto.randomBytes(24).toString('hex');

  const sub = await prisma.newsletterSubscriber.upsert({
    where: { email: normalized },
    create: { email: normalized, token, source },
    update: { unsubscribedAt: null, ...(source ? { source } : {}) },
  });

  if (!sub.confirmedAt) {
    await sendEmail({
      to: normalized,
      subject: 'Confirm your Polar Science Portal subscription',
      text: `Please confirm your subscription:\n${env.NEXT_PUBLIC_APP_URL}/api/newsletter/confirm?token=${sub.token}\n\nIf you did not request this, ignore this email.`,
    });
  }

  return ok({ status: sub.confirmedAt ? 'already_confirmed' : 'pending_confirmation' });
});

export const GET = handle(async (req) => {
  // Unsubscribe endpoint: /api/newsletter?unsubscribe=TOKEN
  const url = new URL(req.url);
  const token = url.searchParams.get('unsubscribe');
  if (!token) return ok({ ok: true });
  await prisma.newsletterSubscriber.updateMany({
    where: { token },
    data: { unsubscribedAt: new Date() },
  });
  return ok({ status: 'unsubscribed' });
});
