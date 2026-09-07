import { prisma } from '@/lib/db';
import { handle, paginated, created, readJson, enforceRateLimit } from '@/lib/api';
import { requirePermission } from '@/lib/auth/session';
import { datasetCreateSchema } from '@/lib/validation';
import { pageArgs, textWhere } from '@/lib/services/list-helpers';
import { uniqueSlug } from '@/lib/utils';
import { recordAudit } from '@/lib/audit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = handle(async (req) => {
  const p = new URL(req.url).searchParams;
  const { skip, take, page, pageSize } = pageArgs(Number(p.get('page') ?? 1), Number(p.get('pageSize') ?? 12));
  const where = {
    status: 'PUBLISHED' as const,
    ...(p.get('pole') ? { pole: p.get('pole') as never } : {}),
    ...(p.get('discipline') ? { discipline: p.get('discipline') as never } : {}),
    ...(textWhere(p.get('q'), ['title', 'description', 'source']) ?? {}),
  };
  const [items, total] = await Promise.all([
    prisma.dataset.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: { institution: { select: { name: true, slug: true } }, versions: { orderBy: { releasedAt: 'desc' }, take: 1 } },
    }),
    prisma.dataset.count({ where }),
  ]);
  return paginated(items, { total, page, pageSize });
});

export const POST = handle(async (req) => {
  const user = await requirePermission('dataset:manage');
  enforceRateLimit(req, `dataset-create:${user.id}`, { max: 30 });
  const input = datasetCreateSchema.parse(await readJson(req));
  const status = input.status ?? 'DRAFT';

  const dataset = await prisma.dataset.create({
    data: {
      slug: uniqueSlug(input.title),
      title: input.title,
      description: input.description,
      discipline: input.discipline,
      pole: input.pole,
      unit: input.unit || null,
      variable: input.variable || null,
      temporalStart: input.temporalStart ?? null,
      temporalEnd: input.temporalEnd ?? null,
      source: input.source,
      publisher: input.publisher || null,
      methodology: input.methodology || null,
      license: input.license,
      doi: input.doi || null,
      externalUrl: input.externalUrl || null,
      status,
      isDemo: input.isDemo,
      lastUpdatedAt: new Date(),
      institutionId: input.institutionId || null,
      createdById: user.id,
      versions: {
        create: {
          version: input.version ?? 'v1',
          series: input.series ? (input.series as object) : undefined,
          rowCount: input.series?.length ?? null,
        },
      },
    },
    include: { versions: true },
  });

  await recordAudit({
    actorId: user.id,
    action: 'dataset.create',
    entityType: 'Dataset',
    entityId: dataset.id,
    req,
  });
  return created(dataset);
});
