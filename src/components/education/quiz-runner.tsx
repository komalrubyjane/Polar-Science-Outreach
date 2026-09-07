'use client';

import * as React from 'react';
import { CheckCircle2, XCircle, RotateCcw, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Option {
  id: string;
  label: string;
}
interface Question {
  id: string;
  prompt: string;
  options: Option[];
}
interface ReviewItem {
  questionId: string;
  givenOptionId: string | null;
  correctOptionId: string | null;
  isCorrect: boolean;
  explanation: string | null;
}

export function QuizRunner({
  quizId,
  questions,
}: {
  quizId: string;
  questions: Question[];
}) {
  const [answers, setAnswers] = React.useState<Record<string, string>>({});
  const [submitting, setSubmitting] = React.useState(false);
  const [result, setResult] = React.useState<{
    score: number;
    total: number;
    review: ReviewItem[];
  } | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const allAnswered = questions.every((q) => answers[q.id]);

  const submit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/quizzes/${quizId}/attempt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answers: Object.entries(answers).map(([questionId, optionId]) => ({
            questionId,
            optionId,
          })),
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error?.message ?? 'Could not score quiz');
      setResult(json.data);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => {
    setAnswers({});
    setResult(null);
  };

  const reviewFor = (qid: string) => result?.review.find((r) => r.questionId === qid);

  return (
    <div className="space-y-6">
      {result ? (
        <div className="rounded-xl border border-border bg-card p-6 text-center">
          <p className="text-sm text-muted-foreground">Your score</p>
          <p className="font-display text-4xl font-bold">
            {result.score}
            <span className="text-2xl text-muted-foreground"> / {result.total}</span>
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {Math.round((result.score / result.total) * 100)}% correct
          </p>
          <Button onClick={reset} variant="outline" className="mt-4">
            <RotateCcw className="h-4 w-4" /> Try again
          </Button>
        </div>
      ) : null}

      {error ? (
        <p className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <ol className="space-y-6">
        {questions.map((q, i) => {
          const review = reviewFor(q.id);
          return (
            <li key={q.id} className="rounded-xl border border-border bg-card p-5">
              <p className="mb-3 font-medium">
                <span className="text-muted-foreground">{i + 1}.</span> {q.prompt}
              </p>
              <div className="space-y-2">
                {q.options.map((o) => {
                  const selected = answers[q.id] === o.id;
                  const isCorrect = review?.correctOptionId === o.id;
                  const isWrongPick = review && selected && !review.isCorrect;
                  return (
                    <label
                      key={o.id}
                      className={cn(
                        'flex cursor-pointer items-center gap-3 rounded-lg border p-3 text-sm transition-colors',
                        selected ? 'border-accent bg-accent/5' : 'border-border hover:bg-secondary',
                        review && isCorrect && 'border-emerald-500 bg-emerald-500/10',
                        isWrongPick && 'border-destructive bg-destructive/10',
                      )}
                    >
                      <input
                        type="radio"
                        name={q.id}
                        value={o.id}
                        checked={selected}
                        disabled={Boolean(result)}
                        onChange={() => setAnswers((a) => ({ ...a, [q.id]: o.id }))}
                        className="h-4 w-4"
                      />
                      <span className="flex-1">{o.label}</span>
                      {review && isCorrect ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      ) : null}
                      {isWrongPick ? <XCircle className="h-4 w-4 text-destructive" /> : null}
                    </label>
                  );
                })}
              </div>
              {review?.explanation ? (
                <p className="mt-3 rounded-md bg-muted/50 p-3 text-xs text-muted-foreground">
                  {review.explanation}
                </p>
              ) : null}
            </li>
          );
        })}
      </ol>

      {!result ? (
        <Button onClick={submit} disabled={!allAnswered || submitting} size="lg">
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {allAnswered ? 'Submit answers' : `Answer all ${questions.length} questions`}
        </Button>
      ) : null}
    </div>
  );
}
