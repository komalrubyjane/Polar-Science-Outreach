import type { Metadata } from 'next';
import Link from 'next/link';
import { GraduationCap, Gamepad2, HelpCircle, BookOpen } from 'lucide-react';
import { prisma } from '@/lib/db';
import { safe } from '@/lib/safe';
import { PageHero } from '@/components/content/page-hero';
import { FilterBar } from '@/components/content/filter-bar';
import { EducationCard } from '@/components/content/cards';
import { Pagination } from '@/components/ui/pagination';
import { EmptyState } from '@/components/ui/misc';
import { pageArgs, textWhere } from '@/lib/services/list-helpers';
import { EDUCATION_TYPE_LABELS } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Education & Outreach',
  description:
    'Explainers, lesson plans, interactive activities and quizzes about polar science for students, teachers and the public.',
};

export const dynamic = 'force-dynamic';

export default async function EducationPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const get = (k: string) => (Array.isArray(sp[k]) ? sp[k]![0] : (sp[k] as string | undefined));
  const page = Number(get('page') ?? '1') || 1;
  const { skip, take, pageSize } = pageArgs(page, 12);

  const where = {
    status: 'PUBLISHED' as const,
    ...(get('type') ? { type: get('type') as never } : {}),
    ...(textWhere(get('q'), ['title', 'summary', 'body']) ?? {}),
  };

  const [items, total] = await Promise.all([
    safe(
      () => prisma.educationResource.findMany({ where, skip, take, orderBy: { createdAt: 'desc' } }),
      [],
      'eduList',
    ),
    safe(() => prisma.educationResource.count({ where }), 0, 'eduCount'),
  ]);
  const pageCount = Math.max(1, Math.ceil(total / pageSize));

  return (
    <>
      <PageHero
        imageSlot="education"
        eyebrow="Education & Outreach"
        title="Learn about the polar regions"
        description="Plain-language explainers, classroom-ready lesson plans, hands-on interactive activities and quizzes. No account needed."
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Education' }]}
      />
      <div className="container-page py-10">
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <QuickLink href="/education?type=EXPLAINER" icon={BookOpen} label="Explainers" desc="Short, simple answers to big questions" />
          <QuickLink href="/education?type=LESSON_PLAN" icon={GraduationCap} label="Lesson plans" desc="Objectives, materials, assessment, PDF" />
          <QuickLink href="/education/activities" icon={Gamepad2} label="Interactive activities" desc="Simulators and hands-on models" />
          <QuickLink href="/education/quizzes" icon={HelpCircle} label="Quizzes" desc="Test your polar knowledge" />
        </div>

        <FilterBar
          searchPlaceholder="Search education resources…"
          fields={[
            {
              key: 'type',
              label: 'Resource type',
              options: Object.entries(EDUCATION_TYPE_LABELS).map(([value, label]) => ({
                value,
                label,
              })),
            },
          ]}
        />

        {items.length ? (
          <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {items.map((e) => (
                <EducationCard key={e.id} data={e} />
              ))}
            </div>
            <Pagination page={page} pageCount={pageCount} />
          </>
        ) : (
          <EmptyState title="No resources published yet" description="Seed the database to load demo education content." />
        )}
      </div>
    </>
  );
}

function QuickLink({
  href,
  icon: Icon,
  label,
  desc,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  desc: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-xl border border-border bg-card p-4 transition-shadow hover:shadow-md"
    >
      <Icon className="mb-2 h-5 w-5 text-accent" />
      <p className="font-display font-semibold">{label}</p>
      <p className="mt-1 text-xs text-muted-foreground">{desc}</p>
    </Link>
  );
}
