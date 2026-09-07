import { prisma } from '@/lib/db';
import { handle, ok, fail, readJson, enforceRateLimit } from '@/lib/api';
import { getCurrentUser } from '@/lib/auth/session';
import { quizAttemptSchema } from '@/lib/validation';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Score a quiz attempt. Works for anonymous visitors (no account required). */
export const POST = handle(async (req, ctx) => {
  enforceRateLimit(req, 'quiz-attempt', { max: 60 });
  const { id } = await ctx.params;
  const { answers } = quizAttemptSchema.parse(await readJson(req));

  const quiz = await prisma.quiz.findFirst({
    where: { OR: [{ id }, { slug: id }], isPublished: true },
    include: { questions: { include: { options: true } } },
  });
  if (!quiz) return fail(404, 'Quiz not found');

  const correctByQuestion = new Map(
    quiz.questions.map((q) => [q.id, q.options.find((o) => o.isCorrect)?.id ?? null]),
  );

  let score = 0;
  const review = quiz.questions.map((q) => {
    const given = answers.find((a) => a.questionId === q.id)?.optionId ?? null;
    const correct = correctByQuestion.get(q.id) ?? null;
    const isCorrect = given != null && given === correct;
    if (isCorrect) score += 1;
    return {
      questionId: q.id,
      prompt: q.prompt,
      givenOptionId: given,
      correctOptionId: correct,
      isCorrect,
      explanation: q.explanation,
    };
  });

  const user = await getCurrentUser();
  const attempt = await prisma.quizAttempt.create({
    data: {
      quizId: quiz.id,
      userId: user?.id ?? null,
      score,
      total: quiz.questions.length,
      answers: answers as object,
    },
  });

  return ok({ attemptId: attempt.id, score, total: quiz.questions.length, review });
});
