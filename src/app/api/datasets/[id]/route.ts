import { prisma } from '@/lib/db';
import { handle, ok, fail, readJson } from '@/lib/api';
import { getCurrentUser, requirePermission } from '@/lib/auth/session';
import { can } from '@/lib/rbac';
import { datasetUpdateSchema } from '@/lib/validation';
import { recordAudit } from '@/lib/audit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = handle(async (_req, ctx) => {
  const { id } = await ctx.params;
  const dataset = await prisma.dataset.findFirst({
    where: { OR: [{ id }, { slug: id }] },
    include: {
      institution: { select: { name: true, slug: true } },
      versions: { orderBy: { releasedAt: 'desc' } },
      relatedResearch: { include: { research: { select: { id: true, slug: true, title: true } } } },
    },
  });
  if (!dataset) return fail(404, 'Dataset not found');
  if (dataset.status !== 'PUBLISHED') {
    const user = await getCurrentUser();
    if (!can(user?.role, 'content:review')) return fail(404, 'Dataset not found');
  }
  return ok(dataset);
});

export const PUT = handle(async (req, ctx) => {
  const { id } = await ctx.params;
  const user = await requirePermission('dataset:manage');
  const input = datasetUpdateSchema.parse(await readJson(req));
  const data: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(input)) {
    if (v === undefined) continue;
    if (k === 'series' || k === 'version') continue;
    data[k] = v === '' ? null : v;
  }
  data.lastUpdatedAt = new Date();

  const dataset = await prisma.dataset.update({ where: { id }, data }).catch(() => null);
  if (!dataset) return fail(404, 'Dataset not found');

  if (input.series && input.version) {
    await prisma.datasetVersion.upsert({
      where: { datasetId_version: { datasetId: id, version: input.version } },
      create: {
        datasetId: id,
        version: input.version,
        series: input.series as object,
        rowCount: input.series.length,
      },
      update: { series: input.series as object, rowCount: input.series.length },
    });
  }

  await recordAudit({
    actorId: user.id,
    action: 'dataset.update',
    entityType: 'Dataset',
    entityId: id,
    req,
  });
  return ok(dataset);
});

export const DELETE = handle(async (req, ctx) => {
  const { id } = await ctx.params;
  const user = await requirePermission('dataset:manage');
  await prisma.dataset.delete({ where: { id } }).catch(() => {
    throw new Error('not found');
  });
  await recordAudit({
    actorId: user.id,
    action: 'dataset.delete',
    entityType: 'Dataset',
    entityId: id,
    req,
  });
  return ok({ deleted: true });
});
