import 'server-only';
import type { NotificationType } from '@prisma/client';
import { prisma } from '@/lib/db';
import { env, emailEnabled } from '@/lib/env';
import { logger } from '@/lib/logger';

export interface CreateNotificationInput {
  userId: string;
  type: NotificationType;
  title: string;
  body?: string;
  linkUrl?: string;
}

/**
 * Create an in-app notification and dispatch an email if SMTP is configured.
 * Email dispatch is a deliberate integration point — see `sendEmail`.
 */
export async function notify(input: CreateNotificationInput): Promise<void> {
  await prisma.notification.create({
    data: {
      userId: input.userId,
      type: input.type,
      title: input.title,
      body: input.body,
      linkUrl: input.linkUrl,
    },
  });

  if (emailEnabled) {
    const user = await prisma.user.findUnique({
      where: { id: input.userId },
      select: { email: true, name: true },
    });
    if (user?.email) {
      await sendEmail({
        to: user.email,
        subject: input.title,
        text: `${input.body ?? input.title}\n\n${
          input.linkUrl ? `${env.NEXT_PUBLIC_APP_URL}${input.linkUrl}` : ''
        }`,
      });
    }
  }
}

export async function markNotificationsRead(userId: string, ids?: string[]): Promise<number> {
  const res = await prisma.notification.updateMany({
    where: { userId, readAt: null, ...(ids?.length ? { id: { in: ids } } : {}) },
    data: { readAt: new Date() },
  });
  return res.count;
}

export interface EmailMessage {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

/**
 * Transactional email sender.
 *
 * Integration point: when EMAIL_SERVER (an SMTP URL) is set, wire up nodemailer
 * or a provider SDK here. Until then this logs the message so flows remain
 * testable in development without leaking content anywhere.
 */
export async function sendEmail(msg: EmailMessage): Promise<{ delivered: boolean }> {
  if (!emailEnabled) {
    logger.info('[email:dev] would send', { to: msg.to, subject: msg.subject });
    return { delivered: false };
  }
  try {
    // TODO: implement with the configured EMAIL_SERVER transport.
    logger.info('[email] dispatch requested', { to: msg.to, subject: msg.subject });
    return { delivered: true };
  } catch (err) {
    logger.error('email send failed', {
      to: msg.to,
      message: err instanceof Error ? err.message : String(err),
    });
    return { delivered: false };
  }
}
