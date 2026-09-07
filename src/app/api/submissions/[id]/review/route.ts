import { prisma } from '@/lib/db';
import { handle, ok, fail, readJson } from '@/lib/api';
import { requirePermission } from '@/lib/auth/session';
import { reviewDecisionSchema } from '@/lib/validation';
import { recordAudit } from '@/lib/audit';
import { notify } from '@/lib/notifications';
import { createResearch } from '@/lib/services/research';
import { researchCreateSchema } from '@/lib/validation';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Editor decision on a submission.
 * APPROVED → the proposed entity is created/published and the submission closed.
 * REJECTED / CHANGES_REQUESTED → author is notified with the reviewer comment.
 */
export const POST = handle(async (req, ctx) => {
  const { id } = await ctx.params;
  const reviewer = await requirePermission('content:review');
  const { decision, comment } = reviewDecisionSchema.parse(await readJson(req));

  const submission = await prisma.submission.findUnique({ where: { id } });
  if (!submission) return fail(404, 'Submission not found');
  if (['APPROVED', 'REJECTED', 'ARCHIVED'].includes(submission.status)) {
    return fail(409, 'This submission has already been decided');
  }

  await prisma.review.create({
    data: { submissionId: id, reviewerId: reviewer.id, decision, comment: comment || null },
  });

  let createdEntityId: string | null = submission.entityId;

  if (decision === 'APPROVED') {
    if (submission.kind === 'RESEARCH' && !submission.entityId) {
      const parsed = researchCreateSchema.safeParse({
        ...(submission.payload as object),
        status: 'PUBLISHED',
      });
      if (parsed.success) {
        const research = await createResearch(parsed.data, submission.authorId);
        createdEntityId = research.id;
      }
    } else if (submission.entityId) {
      // Entity already exists (edit/update submission) — publish it.
      const model = {
        RESEARCH: 'research',
        DATASET: 'dataset',
        MEDIA: 'media',
        NEWS: 'newsArticle',
        EXPEDITION_UPDATE: 'expeditionUpdate',
      }[submission.kind];
      if (model && model !== 'expeditionUpdate') {
        // @ts-expect-error dynamic delegate
        await prisma[model]
          .update({ where: { id: submission.entityId }, data: { status: 'PUBLISHED' } })
          .catch(() => undefined);
      }
    }
  }

  const newStatus =
    decision === 'APPROVED' ? 'APPROVED' : decision === 'REJECTED' ? 'REJECTED' : 'UNDER_REVIEW';

  await prisma.submission.update({
    where: { id },
    data: {
      status: newStatus,
      decidedAt: decision === 'APPROVED' || decision === 'REJECTED' ? new Date() : null,
      entityId: createdEntityId,
    },
  });

  await recordAudit({
    actorId: reviewer.id,
    action: `submission.${decision.toLowerCase()}`,
    entityType: 'Submission',
    entityId: id,
    metadata: { kind: submission.kind },
    req,
  });

  await notify({
    userId: submission.authorId,
    type: decision === 'APPROVED' ? 'SUBMISSION_APPROVED' : 'SUBMISSION_REJECTED',
    title:
      decision === 'APPROVED'
        ? `Your submission "${submission.title}" was approved`
        : decision === 'REJECTED'
          ? `Your submission "${submission.title}" was not accepted`
          : `Changes requested on "${submission.title}"`,
    body: comment || undefined,
    linkUrl: '/submit',
  });

  return ok({ decision, status: newStatus, entityId: createdEntityId });
});
