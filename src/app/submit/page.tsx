import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { safe } from '@/lib/safe';
import { getCurrentUser } from '@/lib/auth/session';
import { can } from '@/lib/rbac';
import { PageHero } from '@/components/content/page-hero';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/misc';
import { ResearchSubmitForm } from '@/components/submit/research-submit-form';
import { formatDate } from '@/lib/utils';
import { STATUS_LABELS } from '@/lib/constants';

export const metadata: Metadata = { title: 'Submit content' };
export const dynamic = 'force-dynamic';

const STATUS_VARIANT: Record<string, 'secondary' | 'warning' | 'success' | 'danger'> = {
  SUBMITTED: 'warning',
  UNDER_REVIEW: 'warning',
  APPROVED: 'success',
  PUBLISHED: 'success',
  REJECTED: 'danger',
  ARCHIVED: 'secondary',
};

export default async function SubmitPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login?callbackUrl=/submit');
  if (!can(user.role, 'content:submit')) {
    return (
      <>
        <PageHero eyebrow="Contribute" title="Submit content" />
        <div className="container-page py-10">
          <EmptyState
            title="Researcher access required"
            description="Submitting research, datasets and expedition updates requires a Researcher, Editor or Administrator role. Contact an administrator to request an upgrade."
          />
        </div>
      </>
    );
  }

  const [institutions, submissions] = await Promise.all([
    safe(
      () => prisma.institution.findMany({ select: { id: true, name: true }, orderBy: { name: 'asc' } }),
      [],
      'submitInstitutions',
    ),
    safe(
      () =>
        prisma.submission.findMany({
          where: { authorId: user.id },
          orderBy: { submittedAt: 'desc' },
          include: {
            reviews: {
              orderBy: { createdAt: 'desc' },
              take: 1,
              include: { reviewer: { select: { name: true } } },
            },
          },
        }),
      [],
      'submitSubmissions',
    ),
  ]);

  return (
    <>
      <PageHero
        eyebrow="Contribute"
        title="Submit content for review"
        description="Propose a research record. An editor reviews every submission before it is published. You can track the status of your submissions below."
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Submit' }]}
      />
      <div className="container-page grid gap-10 py-10 lg:grid-cols-[1fr_320px]">
        <div>
          <h2 className="mb-4 font-display text-xl font-semibold">New research submission</h2>
          <ResearchSubmitForm institutions={institutions} />
        </div>

        <aside>
          <h2 className="mb-4 font-display text-lg font-semibold">Your submissions</h2>
          {submissions.length ? (
            <ul className="space-y-3">
              {submissions.map((s) => (
                <Card key={s.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between gap-2">
                      <Badge variant={STATUS_VARIANT[s.status] ?? 'secondary'}>
                        {STATUS_LABELS[s.status] ?? s.status}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(s.submittedAt)}
                      </span>
                    </div>
                    <CardTitle className="text-sm">{s.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-xs text-muted-foreground">
                    <p>Type: {s.kind}</p>
                    {s.reviews[0]?.comment ? (
                      <p className="mt-1 rounded bg-muted/50 p-2">
                        <strong>Reviewer{s.reviews[0].reviewer?.name ? ` (${s.reviews[0].reviewer.name})` : ''}:</strong>{' '}
                        {s.reviews[0].comment}
                      </p>
                    ) : null}
                  </CardContent>
                </Card>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">
              You haven&apos;t submitted anything yet.
            </p>
          )}
        </aside>
      </div>
    </>
  );
}
