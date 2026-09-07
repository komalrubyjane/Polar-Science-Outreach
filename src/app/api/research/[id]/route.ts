import { prisma } from '@/lib/db';
import { handle, ok, fail, readJson } from '@/lib/api';
import { getCurrentUser, requirePermission } from '@/lib/auth/session';
import { can } from '@/lib/rbac';
import { researchUpdateSchema } from '@/lib/validation';
import { updateResearch, researchDetailInclude } from '@/lib/services/research';
import { recordAudit } from '@/lib/audit';
import { notify } from '@/lib/notifications';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function findByIdOrSlug(idOrSlug: string) {
  return prisma.research.findFirst({
    where: { OR: [{ id: idOrSlug }, { slug: idOrSlug }] },
    include: researchDetailInclude,
  });
}

export const GET = handle(async (_req, ctx) => {
  const { id } = await ctx.params;
  const research = await findByIdOrSlug(id);
  if (!research) return fail(404, 'Research not found');

  if (research.status !== 'PUBLISHED') {
    const user = await getCurrentUser();
    const owns = user && research.createdById === user.id;
    if (!owns && !can(user?.role, 'content:review')) {
      return fail(404, 'Research not found');
    }
  }
  return ok(research);
});

export const PUT = handle(async (req, ctx) => {
  const { id } = await ctx.params;
  const user = await requirePermission('content:submit');

  const current = await prisma.research.findUnique({
    where: { id },
    select: { id: true, createdById: true, status: true },
  });
  if (!current) return fail(404, 'Research not found');

  const isOwner = current.createdById === user.id;
  const isEditor = can(user.role, 'content:review');
  if (!isOwner && !isEditor) return fail(403, 'You cannot edit this record');

  const input = researchUpdateSchema.parse(await readJson(req));

  // Only editors/admins may change status to APPROVED/PUBLISHED/ARCHIVED.
  if (
    input.status &&
    ['APPROVED', 'PUBLISHED', 'ARCHIVED'].includes(input.status) &&
    !can(user.role, 'content:publish')
  ) {
    return fail(403, 'Only editors can publish or archive');
  }

  const updated = await updateResearch(id, input, user.id);
  if (!updated) return fail(404, 'Research not found');

  await recordAudit({
    actorId: user.id,
    action: input.status === 'PUBLISHED' ? 'research.publish' : 'research.update',
    entityType: 'Research',
    entityId: id,
    metadata: { status: updated.status },
    req,
  });

  if (input.status === 'PUBLISHED' && current.createdById && current.createdById !== user.id) {
    await notify({
      userId: current.createdById,
      type: 'RESEARCH_PUBLISHED',
      title: 'Your research has been published',
      body: updated.title,
      linkUrl: `/repository/${updated.slug}`,
    });
  }

  return ok(updated);
});

export const DELETE = handle(async (req, ctx) => {
  const { id } = await ctx.params;
  const user = await requirePermission('research:manage');
  const current = await prisma.research.findUnique({
    where: { id },
    select: { createdById: true, title: true },
  });
  if (!current) return fail(404, 'Research not found');
  if (current.createdById !== user.id && !can(user.role, 'content:review')) {
    return fail(403, 'You cannot delete this record');
  }
  await prisma.research.delete({ where: { id } });
  await recordAudit({
    actorId: user.id,
    action: 'research.delete',
    entityType: 'Research',
    entityId: id,
    metadata: { title: current.title },
    req,
  });
  return ok({ deleted: true });
});
