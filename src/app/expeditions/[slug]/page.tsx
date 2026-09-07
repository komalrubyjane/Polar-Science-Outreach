import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Ship, Users, Target, MapPin, CalendarRange } from 'lucide-react';
import { prisma } from '@/lib/db';
import { safe } from '@/lib/safe';
import { auth } from '@/auth';
import { renderMarkdown } from '@/lib/markdown';
import { PageHero } from '@/components/content/page-hero';
import { Badge } from '@/components/ui/badge';
import { BookmarkButton } from '@/components/content/bookmark-button';
import { formatDate, formatDateTime } from '@/lib/utils';

export const dynamic = 'force-dynamic';

async function getExpedition(slug: string) {
  return safe(
    () =>
      prisma.expedition.findFirst({
        where: { slug },
        include: {
          region: { select: { name: true, pole: true } },
          institution: { select: { name: true, slug: true } },
          members: {
            include: { researcher: { select: { fullName: true, slug: true, title: true } } },
          },
          updates: {
            orderBy: [{ dayNumber: 'asc' }, { postedAt: 'asc' }],
            include: { author: { select: { name: true } } },
          },
        },
      }),
    null,
    'expDetail',
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const e = await getExpedition(slug);
  if (!e) return { title: 'Expedition not found' };
  return { title: e.name, description: e.summary?.slice(0, 200) ?? `Polar expedition: ${e.name}` };
}

export default async function ExpeditionDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const expedition = await getExpedition(slug);
  if (!expedition) notFound();

  const session = await auth();
  if (
    expedition.status !== 'PUBLISHED' &&
    !['EDITOR', 'ADMIN'].includes(session?.user?.role ?? '')
  ) {
    notFound();
  }

  const lead = expedition.members.find((m) => /lead/i.test(m.role));

  return (
    <>
      <PageHero
        eyebrow={expedition.expeditionNumber ? `Expedition ${expedition.expeditionNumber}` : 'Expedition'}
        title={expedition.name}
        description={expedition.summary ?? undefined}
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Expeditions', href: '/expeditions' },
          { label: expedition.name },
        ]}
      >
        <div className="flex flex-wrap items-center gap-3">
          {expedition.region ? <Badge variant="accent">{expedition.region.name}</Badge> : null}
          {expedition.isDemo ? <Badge variant="demo">Demo expedition</Badge> : null}
          <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
            <CalendarRange className="h-4 w-4" />
            {formatDate(expedition.startDate)} – {formatDate(expedition.endDate)}
          </span>
        </div>
      </PageHero>

      <div className="container-page grid gap-10 py-10 lg:grid-cols-[1fr_300px]">
        <div className="space-y-10">
          {expedition.objectives ? (
            <section>
              <h2 className="mb-2 flex items-center gap-2 font-display text-xl font-semibold">
                <Target className="h-5 w-5 text-accent" /> Objectives
              </h2>
              <div
                className="prose-polar"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(expedition.objectives) }}
              />
            </section>
          ) : null}

          {expedition.researchTopics.length ? (
            <section>
              <h2 className="mb-3 font-display text-xl font-semibold">Research topics</h2>
              <div className="flex flex-wrap gap-1.5">
                {expedition.researchTopics.map((t) => (
                  <Badge key={t} variant="secondary">
                    {t}
                  </Badge>
                ))}
              </div>
            </section>
          ) : null}

          <section>
            <h2 className="mb-4 font-display text-xl font-semibold">Expedition journal</h2>
            {expedition.updates.length ? (
              <ol className="relative space-y-6 border-l-2 border-border pl-6">
                {expedition.updates.map((u) => (
                  <li key={u.id} className="relative">
                    <span className="absolute -left-[31px] top-1 h-4 w-4 rounded-full border-2 border-accent bg-background" />
                    <div className="flex flex-wrap items-baseline gap-2">
                      {u.dayNumber != null ? (
                        <span className="rounded bg-accent/10 px-2 py-0.5 text-xs font-semibold text-accent">
                          Day {u.dayNumber}
                        </span>
                      ) : null}
                      <span className="text-xs text-muted-foreground">
                        {formatDateTime(u.postedAt)}
                      </span>
                      {u.locationName ? (
                        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3" /> {u.locationName}
                        </span>
                      ) : null}
                    </div>
                    <h3 className="mt-1 font-display font-semibold">{u.title}</h3>
                    <div
                      className="prose-polar mt-1 text-sm"
                      dangerouslySetInnerHTML={{ __html: renderMarkdown(u.body) }}
                    />
                    {u.imageUrls.length ? (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {u.imageUrls.map((src) => (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            key={src}
                            src={src}
                            alt=""
                            className="h-24 w-32 rounded object-cover"
                            loading="lazy"
                          />
                        ))}
                      </div>
                    ) : null}
                    {u.author?.name ? (
                      <p className="mt-1 text-xs text-muted-foreground">— {u.author.name}</p>
                    ) : null}
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-sm text-muted-foreground">
                No journal entries have been published for this expedition yet.
              </p>
            )}
          </section>
        </div>

        <aside className="space-y-5">
          <BookmarkButton entityType="EXPEDITION" entityId={expedition.id} />
          <div className="rounded-xl border border-border bg-card p-4 text-sm">
            <dl className="space-y-2">
              {expedition.vessel ? (
                <div className="flex items-center gap-2">
                  <Ship className="h-4 w-4 text-accent" />
                  <span className="text-muted-foreground">{expedition.vessel}</span>
                </div>
              ) : null}
              {lead ? (
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-accent" />
                  <span className="text-muted-foreground">
                    Lead: {lead.researcher.fullName}
                  </span>
                </div>
              ) : null}
              {expedition.institution ? (
                <div className="text-muted-foreground">
                  Operator: {expedition.institution.name}
                </div>
              ) : null}
            </dl>
          </div>

          {expedition.members.length ? (
            <div className="rounded-xl border border-border bg-card p-4">
              <h3 className="mb-2 text-sm font-semibold">Team</h3>
              <ul className="space-y-2 text-sm">
                {expedition.members.map((m) => (
                  <li key={m.id}>
                    <Link
                      href={`/researchers/${m.researcher.slug}`}
                      className="font-medium hover:text-accent"
                    >
                      {m.researcher.fullName}
                    </Link>
                    <p className="text-xs text-muted-foreground">{m.role}</p>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </aside>
      </div>
    </>
  );
}
