import type { Metadata } from 'next';
import Link from 'next/link';
import { HelpCircle } from 'lucide-react';
import { prisma } from '@/lib/db';
import { safe } from '@/lib/safe';
import { PageHero } from '@/components/content/page-hero';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/misc';

export const metadata: Metadata = {
  title: 'Quizzes',
  description: 'Test your knowledge of polar science. Quizzes are open to everyone — no account required.',
};

export const revalidate = 300;

export default async function QuizzesPage() {
  const quizzes = await safe(
    () =>
      prisma.quiz.findMany({
        where: { isPublished: true },
        orderBy: { createdAt: 'desc' },
        include: { _count: { select: { questions: true, attempts: true } } },
      }),
    [],
    'quizList',
  );

  return (
    <>
      <PageHero
        eyebrow="Education & Outreach"
        title="Polar science quizzes"
        description="Quick self-assessment quizzes. Your score is calculated instantly; you can take them without signing in."
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Education', href: '/education' },
          { label: 'Quizzes' },
        ]}
      />
      <div className="container-page py-10">
        {quizzes.length ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {quizzes.map((q) => (
              <Link key={q.id} href={`/education/quizzes/${q.slug}`}>
                <Card className="h-full transition-shadow hover:shadow-md">
                  <CardHeader className="pb-2">
                    <HelpCircle className="mb-1 h-5 w-5 text-accent" />
                    <CardTitle className="text-base">{q.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground">
                    {q.description ? <p className="mb-2">{q.description}</p> : null}
                    <p className="text-xs">
                      {q._count.questions} questions · {q._count.attempts} attempts · {q.category}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState title="No quizzes yet" description="Seed the database to load demo quizzes." />
        )}
      </div>
    </>
  );
}
