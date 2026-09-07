import Link from 'next/link';
import type { Metadata } from 'next';
import {
  ArrowRight,
  Snowflake,
  Thermometer,
  Building2,
  Compass,
  FileText,
} from 'lucide-react';
import { Hero } from '@/components/home/hero';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SectionHeading, EmptyState } from '@/components/ui/misc';
import {
  ResearchCard,
  MediaCard,
  EventCard,
  ArticleCard,
  EducationCard,
} from '@/components/content/cards';
import { NewsletterForm } from '@/components/newsletter-form';
import {
  getFeaturedResearch,
  getLatestDiscoveries,
  getFeaturedMedia,
  getUpcomingEvents,
  getLatestNews,
  getEducationHighlights,
  getPolarSnapshot,
} from '@/lib/queries';
import { formatDateTime, formatNumber } from '@/lib/utils';
import { DISCIPLINE_LABELS } from '@/lib/constants';

export const metadata: Metadata = {
  description:
    'Explore research, data, discoveries, expeditions, educational resources and stories from the Arctic and Antarctic.',
};

export const revalidate = 300;

export default async function HomePage() {
  const [featured, discoveries, media, events, news, education, snapshot] = await Promise.all([
    getFeaturedResearch(3),
    getLatestDiscoveries(6),
    getFeaturedMedia(8),
    getUpcomingEvents(4),
    getLatestNews(3),
    getEducationHighlights(3),
    getPolarSnapshot(),
  ]);

  return (
    <>
      <Hero />

      {/* A. Polar Regions */}
      <section className="container-page py-16">
        <SectionHeading
          eyebrow="Two poles, one system"
          title="The Polar Regions"
          description="The Arctic and Antarctic differ profoundly — an ocean ringed by land versus a continent ringed by ocean — yet both regulate the planet's climate and are changing fast."
        />
        <div className="grid gap-6 md:grid-cols-2">
          <RegionCard
            pole="Arctic"
            href="/explore?pole=ARCTIC"
            blurb="A sea-ice-covered ocean surrounded by the landmasses of North America, Europe and Asia. Home to four million people, including many Indigenous nations."
            stats={[
              ['Area of Arctic Ocean', '~14 million km²'],
              ['Sea ice minimum (Sep)', 'Long-term decline'],
              ['Countries with territory', '8'],
            ]}
          />
          <RegionCard
            pole="Antarctic"
            href="/explore?pole=ANTARCTIC"
            blurb="A continent larger than Europe, buried under ice up to 4.8 km thick, governed by the Antarctic Treaty and dedicated to peace and science."
            stats={[
              ['Ice sheet area', '~14 million km²'],
              ['Share of Earth’s fresh water', '~60%'],
              ['Permanent residents', '0'],
            ]}
          />
        </div>
      </section>

      {/* B. Live Polar Snapshot */}
      <section className="border-y border-border bg-card">
        <div className="container-page py-14">
          <SectionHeading
            eyebrow="Live Polar Snapshot"
            title="Key polar indicators"
            description="Environmental values below are drawn from clearly-labelled demo datasets for interface demonstration. Platform counts are live from this deployment's database."
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <MetricCard
              icon={Snowflake}
              label="Arctic sea ice extent"
              value={snapshot.seaIceArcticExtent != null ? `${snapshot.seaIceArcticExtent} M km²` : '—'}
              note="Demo dataset"
              demo
            />
            <MetricCard
              icon={Snowflake}
              label="Antarctic sea ice extent"
              value={
                snapshot.seaIceAntarcticExtent != null
                  ? `${snapshot.seaIceAntarcticExtent} M km²`
                  : '—'
              }
              note="Demo dataset"
              demo
            />
            <MetricCard
              icon={Thermometer}
              label="Arctic temp. anomaly"
              value={
                snapshot.arcticTempAnomaly != null
                  ? `${snapshot.arcticTempAnomaly > 0 ? '+' : ''}${snapshot.arcticTempAnomaly} °C`
                  : '—'
              }
              note="Demo dataset vs 1981–2010"
              demo
            />
            <MetricCard
              icon={Building2}
              label="Research stations catalogued"
              value={formatNumber(snapshot.researchStations)}
              note="Live from database"
            />
            <MetricCard
              icon={Compass}
              label="Active expeditions"
              value={formatNumber(snapshot.activeExpeditions)}
              note="Live from database"
            />
            <MetricCard
              icon={FileText}
              label="Publications (last 90 days)"
              value={formatNumber(snapshot.recentPublications)}
              note="Live from database"
            />
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Snapshot generated {formatDateTime(snapshot.generatedAt)}. Source for physical
            indicators: generated demo series (see{' '}
            <Link href="/data" className="text-accent hover:underline">
              Polar Data
            </Link>
            ). The portal is a dissemination platform and not the original data producer.
          </p>
        </div>
      </section>

      {/* C. Featured Research */}
      <section className="container-page py-16">
        <SectionHeading
          eyebrow="Featured Research"
          title="Highlighted from the repository"
          action={
            <Button asChild variant="outline">
              <Link href="/repository">
                All research <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          }
        />
        {featured.length ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featured.map((r) => (
              <ResearchCard key={r.id} data={r} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No published research yet"
            description="Once the database is seeded (npm run db:seed) or content is published, featured research appears here."
          />
        )}
      </section>

      {/* D. Latest Discoveries */}
      <section className="border-y border-border bg-card">
        <div className="container-page py-16">
          <SectionHeading eyebrow="Latest Discoveries" title="Recent additions by discipline" />
          <div className="mb-6 flex flex-wrap gap-2">
            {Object.entries(DISCIPLINE_LABELS).map(([key, label]) => (
              <Link
                key={key}
                href={`/repository?discipline=${key}`}
                className="rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-muted-foreground hover:border-accent hover:text-accent"
              >
                {label}
              </Link>
            ))}
          </div>
          {discoveries.length ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {discoveries.map((r) => (
                <ResearchCard key={r.id} data={r} />
              ))}
            </div>
          ) : (
            <EmptyState title="Nothing published yet" />
          )}
        </div>
      </section>

      {/* E. Featured Media */}
      <section className="container-page py-16">
        <SectionHeading
          eyebrow="Featured Media"
          title="Photos, video, audio & infographics"
          action={
            <Button asChild variant="outline">
              <Link href="/media">
                Media library <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          }
        />
        {media.length ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {media.map((m) => (
              <MediaCard key={m.id} data={m} />
            ))}
          </div>
        ) : (
          <EmptyState title="The media library is empty" />
        )}
      </section>

      {/* F. Upcoming Events */}
      <section className="border-y border-border bg-card">
        <div className="container-page py-16">
          <SectionHeading
            eyebrow="Upcoming Events"
            title="Conferences, webinars & public lectures"
            action={
              <Button asChild variant="outline">
                <Link href="/events">
                  All events <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            }
          />
          {events.length ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {events.map((e) => (
                <EventCard key={e.id} data={e} />
              ))}
            </div>
          ) : (
            <EmptyState title="No upcoming events scheduled" />
          )}
        </div>
      </section>

      {/* G. Education */}
      <section className="container-page py-16">
        <SectionHeading
          eyebrow="Education & Outreach"
          title="For students, teachers and the curious"
          action={
            <Button asChild variant="outline">
              <Link href="/education">
                Explore resources <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          }
        />
        <div className="mb-6 grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {[
            ['Student resources', '/education?type=STUDENT_RESOURCE'],
            ['Teacher resources', '/education?type=TEACHER_RESOURCE'],
            ['Lesson plans', '/education?type=LESSON_PLAN'],
            ['Interactive activities', '/education/activities'],
            ['Quizzes', '/education/quizzes'],
            ['Explainers', '/education?type=EXPLAINER'],
          ].map(([label, href]) => (
            <Link
              key={href}
              href={href}
              className="rounded-lg border border-border bg-card p-4 text-sm font-medium hover:border-accent hover:text-accent"
            >
              {label}
            </Link>
          ))}
        </div>
        {education.length ? (
          <div className="grid gap-6 md:grid-cols-3">
            {education.map((e) => (
              <EducationCard key={e.id} data={e} />
            ))}
          </div>
        ) : (
          <EmptyState title="No education resources published yet" />
        )}
      </section>

      {/* News */}
      <section className="border-t border-border bg-card">
        <div className="container-page py-16">
          <SectionHeading
            eyebrow="News"
            title="From the polar science community"
            action={
              <Button asChild variant="outline">
                <Link href="/news">
                  Newsroom <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            }
          />
          {news.length ? (
            <div className="grid gap-6 md:grid-cols-3">
              {news.map((n) => (
                <ArticleCard key={n.id} data={n} />
              ))}
            </div>
          ) : (
            <EmptyState title="No news articles published yet" />
          )}
        </div>
      </section>

      {/* H. Newsletter */}
      <section className="container-page py-20">
        <div className="mx-auto max-w-2xl rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
          <Badge variant="accent" className="mb-3">
            Newsletter
          </Badge>
          <h2 className="font-display text-2xl font-semibold">Polar science in your inbox</h2>
          <p className="mx-auto mt-2 max-w-md text-muted-foreground">
            A monthly digest of new research, data releases, expeditions and events. Double
            opt-in; unsubscribe anytime.
          </p>
          <div className="mx-auto mt-6 max-w-md">
            <NewsletterForm source="homepage" />
          </div>
        </div>
      </section>
    </>
  );
}

function RegionCard({
  pole,
  blurb,
  stats,
  href,
}: {
  pole: string;
  blurb: string;
  stats: [string, string][];
  href: string;
}) {
  return (
    <Card className="overflow-hidden">
      <div className={`h-2 w-full ${pole === 'Arctic' ? 'bg-ice-500' : 'bg-aurora-cyan'}`} />
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Snowflake className="h-5 w-5 text-accent" /> {pole}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{blurb}</p>
        <dl className="mt-4 divide-y divide-border rounded-lg border border-border">
          {stats.map(([k, v]) => (
            <div key={k} className="flex items-center justify-between px-3 py-2 text-sm">
              <dt className="text-muted-foreground">{k}</dt>
              <dd className="font-medium">{v}</dd>
            </div>
          ))}
        </dl>
        <Button asChild variant="outline" className="mt-5 w-full">
          <Link href={href}>
            Explore the {pole} <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  note,
  demo,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  note: string;
  demo?: boolean;
}) {
  return (
    <div className="rounded-xl border border-border bg-background p-5">
      <div className="flex items-center justify-between">
        <Icon className="h-5 w-5 text-accent" />
        {demo ? <Badge variant="demo">Demo</Badge> : <Badge variant="success">Live</Badge>}
      </div>
      <p className="mt-3 font-display text-2xl font-semibold">{value}</p>
      <p className="mt-1 text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-xs text-muted-foreground/80">{note}</p>
    </div>
  );
}
