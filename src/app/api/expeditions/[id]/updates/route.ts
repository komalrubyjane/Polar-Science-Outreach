import { prisma } from '@/lib/db';
import { handle, created, ok, fail, readJson } from '@/lib/api';
import { requirePermission } from '@/lib/auth/session';
import { expeditionUpdateSchema } from '@/lib/validation';
import { recordAudit } from '@/lib/audit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = handle(async (_req, ctx) => {
  const { id } = await ctx.params;
  const updates = await prisma.expeditionUpdate.findMany({
    where: { expedition: { OR: [{ id }, { slug: id }] } },
    orderBy: { postedAt: 'asc' },
    include: { author: { select: { name: true } } },
  });
  return ok(updates);
});

export const POST = handle(async (req, ctx) => {
  const { id } = await ctx.params;
  const user = await requirePermission('expedition:update');
  const expedition = await prisma.expedition.findFirst({
    where: { OR: [{ id }, { slug: id }] },
    select: { id: true },
  });
  if (!expedition) return fail(404, 'Expedition not found');

  const raw = (await readJson<Record<string, unknown>>(req)) ?? {};
  const input = expeditionUpdateSchema.parse({ ...raw, expeditionId: expedition.id });

  const update = await prisma.expeditionUpdate.create({
    data: {
      expeditionId: expedition.id,
      dayNumber: input.dayNumber ?? null,
      title: input.title,
      body: input.body,
      postedAt: input.postedAt ?? new Date(),
      locationName: input.locationName || null,
      latitude: input.latitude ?? null,
      longitude: input.longitude ?? null,
      imageUrls: input.imageUrls ?? [],
      videoUrl: input.videoUrl || null,
      authorId: user.id,
    },
  });

  await recordAudit({
    actorId: user.id,
    action: 'expedition.update.create',
    entityType: 'ExpeditionUpdate',
    entityId: update.id,
    metadata: { expeditionId: expedition.id },
    req,
  });
  return created(update);
});
