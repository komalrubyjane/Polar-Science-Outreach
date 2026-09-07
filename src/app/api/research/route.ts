import { prisma } from '@/lib/db';
import { handle, created, paginated, readJson, enforceRateLimit } from '@/lib/api';
import { getCurrentUser, requirePermission } from '@/lib/auth/session';
import { can } from '@/lib/rbac';
import { searchRepository } from '@/lib/search';
import { researchCreateSchema } from '@/lib/validation';
import { createResearch } from '@/lib/services/research';
import { recordAudit } from '@/lib/audit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = handle(async (req) => {
  const url = new URL(req.url);
  const p = url.searchParams;
  const user = await getCurrentUser();
  const includeUnpublished =
    p.get('all') === 'true' && can(user?.role, 'content:review');

  const { ids, total, page, pageSize } = await searchRepository({
    q: p.get('q') ?? undefined,
    pole: (p.get('pole') as never) ?? undefined,
    discipline: p.get('discipline') ?? undefined,
    type: p.get('type') ?? undefined,
    institutionId: p.get('institutionId') ?? undefined,
    language: p.get('language') ?? undefined,
    license: p.get('license') ?? undefined,
    yearFrom: p.get('yearFrom') ? Number(p.get('yearFrom')) : undefined,
    yearTo: p.get('yearTo') ? Number(p.get('yearTo')) : undefined,
    sort: (p.get('sort') as never) ?? undefined,
    page: p.get('page') ? Number(p.get('page')) : 1,
    pageSize: p.get('pageSize') ? Number(p.get('pageSize')) : 12,
    includeUnpublished,
  });

  const rows = await prisma.research.findMany({
    where: { id: { in: ids } },
    include: {
      institution: { select: { name: true, slug: true } },
      authors: {
        orderBy: { authorOrder: 'asc' },
        include: { researcher: { select: { fullName: true, slug: true } } },
      },
    },
  });
  // Preserve search rank order.
  const ordered = ids.map((id) => rows.find((r) => r.id === id)).filter(Boolean);

  return paginated(ordered, { total, page, pageSize });
});

export const POST = handle(async (req) => {
  const user = await requirePermission('content:submit');
  enforceRateLimit(req, `research-create:${user.id}`, { max: 20 });
  const input = researchCreateSchema.parse(await readJson(req));

  // Researchers cannot self-publish; force into the workflow.
  if (!can(user.role, 'content:publish') && input.status === 'PUBLISHED') {
    input.status = 'SUBMITTED';
  }

  const research = await createResearch(input, user.id);
  await recordAudit({
    actorId: user.id,
    action: 'research.create',
    entityType: 'Research',
    entityId: research.id,
    metadata: { status: research.status },
    req,
  });
  return created(research);
});
