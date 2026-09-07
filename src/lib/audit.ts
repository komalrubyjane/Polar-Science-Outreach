import 'server-only';
import crypto from 'node:crypto';
import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';
import { env } from '@/lib/env';

export function hashIp(ip: string | null | undefined): string | null {
  if (!ip) return null;
  return crypto
    .createHmac('sha256', env.AUTH_SECRET)
    .update(ip)
    .digest('hex')
    .slice(0, 32);
}

export function ipFromRequest(req: Request): string | null {
  const fwd = req.headers.get('x-forwarded-for');
  return fwd?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || null;
}

export interface AuditInput {
  actorId?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  metadata?: Record<string, unknown>;
  req?: Request;
}

/** Record an administrative / workflow action. Never throws into the caller. */
export async function recordAudit(input: AuditInput): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        actorId: input.actorId ?? null,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId ?? null,
        metadata: (input.metadata ?? {}) as object,
        ipHash: input.req ? hashIp(ipFromRequest(input.req)) : null,
      },
    });
  } catch (err) {
    logger.error('Failed to write audit log', {
      action: input.action,
      message: err instanceof Error ? err.message : String(err),
    });
  }
}
