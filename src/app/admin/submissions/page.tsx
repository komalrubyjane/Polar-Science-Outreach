import type { Metadata } from 'next';
import { prisma } from '@/lib/db';
import { safe } from '@/lib/safe';
import { SubmissionsReview } from '@/components/admin/submissions-review';

export const metadata: Metadata = { title: 'Review queue' };
export const dynamic = 'force-dynamic';

export default async function AdminSubmissionsPage() {
  const submissions = await safe(
    () =>
      prisma.submission.findMany({
        orderBy: [{ status: 'asc' }, { submittedAt: 'desc' }],
        take: 100,
        include: {
          author: { select: { name: true, email: true } },
          reviews: {
            orderBy: { createdAt: 'desc' },
            include: { reviewer: { select: { name: true } } },
          },
        },
      }),
    [],
    'adminSubmissions',
  );

  return (
    <div>
      <h1 className="mb-1 font-display text-2xl font-semibold">Review queue</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Approve to create &amp; publish the proposed record. Reject or request changes with a
        comment — the author is notified either way.
      </p>
      <SubmissionsReview
        initial={submissions.map((s) => ({
          id: s.id,
          kind: s.kind,
          title: s.title,
          status: s.status,
          submittedAt: s.submittedAt.toISOString(),
          author: s.author,
          payload: s.payload as Record<string, unknown>,
          lastComment: s.reviews[0]?.comment ?? null,
          lastReviewer: s.reviews[0]?.reviewer?.name ?? null,
        }))}
      />
    </div>
  );
}
