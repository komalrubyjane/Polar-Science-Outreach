import { z } from 'zod';
import { prisma } from '@/lib/db';
import { handle, paginated, created, readJson } from '@/lib/api';
import { requirePermission } from '@/lib/auth/session';
import { can } from '@/lib/rbac';
import { pageArgs } from '@/lib/services/list-helpers';
import { recordAudit } from '@/lib/audit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const submissionSchema = z.object({
  kind: z.enum(['RESEARCH', 'DATASET', 'MEDIA', 'EXPEDITION_UPDATE', 'NEWS']),
  title: z.string().trim().min(1).max(300),
  payload: z.record(z.string(), z.unknown()),
  entityId: z.string().optional(),
});

export const GET = handle(async (req) => {
  const user = await requirePermission('content:submit');
  const p = new URL(req.url).searchParams;
  const { skip, take, page, pageSize } = pageArgs(Number(p.get('page') ?? 1), Number(p.get('pageSize') ?? 20));

  // Reviewers see all; researchers see only their own.
  const where = can(user.role, 'content:review')
    ? { ...(p.get('status') ? { status: p.get('status') as never } : {}) }
    : { authorId: user.id };

  const [items, total] = await Promise.all([
    prisma.submission.findMany({
      where,
      skip,
      take,
      orderBy: { submittedAt: 'desc' },
      include: {
        author: { select: { name: true, email: true } },
        reviews: { orderBy: { createdAt: 'desc' }, include: { reviewer: { select: { name: true } } } },
      },
    }),
    prisma.submission.count({ where }),
  ]);
  return paginated(items, { total, page, pageSize });
});

export const POST = handle(async (req) => {
  const user = await requirePermission('content:submit');
  const input = submissionSchema.parse(await readJson(req));
  const submission = await prisma.submission.create({
    data: {
      kind: input.kind,
      title: input.title,
      payload: input.payload as object,
      entityId: input.entityId ?? null,
      authorId: user.id,
      status: 'SUBMITTED',
      reviews: { create: { decision: 'PENDING' } },
    },
  });
  await recordAudit({
    actorId: user.id,
    action: 'submission.create',
    entityType: 'Submission',
    entityId: submission.id,
    metadata: { kind: input.kind },
    req,
  });
  return created(submission);
});
