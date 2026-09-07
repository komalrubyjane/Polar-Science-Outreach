import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { safe } from '@/lib/safe';
import { PageHero } from '@/components/content/page-hero';
import { QuizRunner } from '@/components/education/quiz-runner';

export const dynamic = 'force-dynamic';

async function getQuiz(slug: string) {
  return safe(
    () =>
      prisma.quiz.findFirst({
        where: { slug, isPublished: true },
        include: {
          questions: {
            orderBy: { position: 'asc' },
            include: { options: { orderBy: { position: 'asc' } } },
          },
        },
      }),
    null,
    'quizDetail',
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const quiz = await getQuiz(slug);
  if (!quiz) return { title: 'Quiz not found' };
  return { title: quiz.title, description: quiz.description ?? `Polar science quiz: ${quiz.title}` };
}

export default async function QuizPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const quiz = await getQuiz(slug);
  if (!quiz || quiz.questions.length === 0) notFound();

  return (
    <>
      <PageHero
        eyebrow="Quiz"
        title={quiz.title}
        description={quiz.description ?? undefined}
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Education', href: '/education' },
          { label: 'Quizzes', href: '/education/quizzes' },
          { label: quiz.title },
        ]}
      />
      <div className="container-page max-w-3xl py-10">
        <QuizRunner
          quizId={quiz.slug}
          questions={quiz.questions.map((q) => ({
            id: q.id,
            prompt: q.prompt,
            options: q.options.map((o) => ({ id: o.id, label: o.label })),
          }))}
        />
      </div>
    </>
  );
}
