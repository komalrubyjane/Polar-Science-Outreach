import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CalendarDays, Clock, MapPin, Users, Mail } from 'lucide-react';
import { prisma } from '@/lib/db';
import { safe } from '@/lib/safe';
import { auth } from '@/auth';
import { renderMarkdown } from '@/lib/markdown';
import { PageHero } from '@/components/content/page-hero';
import { Badge } from '@/components/ui/badge';
import { EventRegistration } from '@/components/content/event-registration';
import { formatDate, formatDateTime, absoluteUrl } from '@/lib/utils';
import { EVENT_TYPE_LABELS } from '@/lib/constants';

export const dynamic = 'force-dynamic';

async function getEvent(slug: string) {
  return safe(
    () =>
      prisma.event.findFirst({
        where: { slug },
        include: { _count: { select: { registrations: true } } },
      }),
    null,
    'eventDetail',
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const e = await getEvent(slug);
  if (!e) return { title: 'Event not found' };
  return {
    title: e.title,
    description: e.description.slice(0, 200),
    openGraph: { type: 'website', title: e.title, images: e.imageUrl ? [e.imageUrl] : undefined },
  };
}

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const event = await getEvent(slug);
  if (!event) notFound();

  const session = await auth();
  if (event.status !== 'PUBLISHED' && !['EDITOR', 'ADMIN'].includes(session?.user?.role ?? '')) {
    notFound();
  }

  const registered = session?.user?.id
    ? await safe(
        () =>
          prisma.eventRegistration
            .findUnique({
              where: { eventId_userId: { eventId: event.id, userId: session!.user!.id } },
            })
            .then(Boolean),
        false,
        'eventRegCheck',
      )
    : false;

  const spotsLeft =
    event.capacity != null ? Math.max(0, event.capacity - event._count.registrations) : null;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: event.title,
    description: event.description,
    startDate: event.startAt.toISOString(),
    endDate: event.endAt?.toISOString(),
    eventAttendanceMode:
      event.mode === 'ONLINE'
        ? 'https://schema.org/OnlineEventAttendanceMode'
        : event.mode === 'HYBRID'
          ? 'https://schema.org/MixedEventAttendanceMode'
          : 'https://schema.org/OfflineEventAttendanceMode',
    location:
      event.mode === 'ONLINE'
        ? { '@type': 'VirtualLocation', url: absoluteUrl(`/events/${event.slug}`) }
        : { '@type': 'Place', name: event.locationName ?? 'TBC' },
    organizer: event.organizer ? { '@type': 'Organization', name: event.organizer } : undefined,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PageHero
        eyebrow={EVENT_TYPE_LABELS[event.type]}
        title={event.title}
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Events', href: '/events' },
          { label: event.title },
        ]}
      >
        <div className="flex flex-wrap gap-1.5">
          <Badge variant="secondary">{EVENT_TYPE_LABELS[event.type]}</Badge>
          <Badge variant="outline">{event.mode.replace('_', '-').toLowerCase()}</Badge>
          {event.isDemo ? <Badge variant="demo">Demo event</Badge> : null}
        </div>
      </PageHero>

      <div className="container-page grid gap-10 py-10 lg:grid-cols-[1fr_320px]">
        <article>
          {event.imageUrl ? (
            <div className="mb-6 aspect-[16/9] w-full overflow-hidden rounded-xl border border-border bg-muted">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={event.imageUrl} alt="" className="h-full w-full object-cover" />
            </div>
          ) : null}
          <div
            className="prose-polar"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(event.description) }}
          />
        </article>

        <aside className="space-y-5">
          <div className="rounded-xl border border-border bg-card p-4 text-sm">
            <dl className="space-y-3">
              <div className="flex gap-2">
                <CalendarDays className="mt-0.5 h-4 w-4 text-accent" />
                <div>
                  <dt className="font-medium">Date</dt>
                  <dd className="text-muted-foreground">
                    {formatDate(event.startAt, { dateStyle: 'full' })}
                  </dd>
                </div>
              </div>
              <div className="flex gap-2">
                <Clock className="mt-0.5 h-4 w-4 text-accent" />
                <div>
                  <dt className="font-medium">Time</dt>
                  <dd className="text-muted-foreground">
                    {formatDateTime(event.startAt)}
                    {event.endAt ? ` – ${formatDateTime(event.endAt)}` : ''} ({event.timezone})
                  </dd>
                </div>
              </div>
              <div className="flex gap-2">
                <MapPin className="mt-0.5 h-4 w-4 text-accent" />
                <div>
                  <dt className="font-medium">Location</dt>
                  <dd className="text-muted-foreground">
                    {event.mode === 'ONLINE'
                      ? 'Online'
                      : event.locationName ?? 'To be confirmed'}
                  </dd>
                </div>
              </div>
              {event.organizer ? (
                <div className="flex gap-2">
                  <Users className="mt-0.5 h-4 w-4 text-accent" />
                  <div>
                    <dt className="font-medium">Organiser</dt>
                    <dd className="text-muted-foreground">{event.organizer}</dd>
                  </div>
                </div>
              ) : null}
              {event.contactEmail ? (
                <div className="flex gap-2">
                  <Mail className="mt-0.5 h-4 w-4 text-accent" />
                  <div>
                    <dt className="font-medium">Contact</dt>
                    <dd className="text-muted-foreground">
                      <a href={`mailto:${event.contactEmail}`} className="hover:underline">
                        {event.contactEmail}
                      </a>
                    </dd>
                  </div>
                </div>
              ) : null}
            </dl>
            {spotsLeft != null ? (
              <p className="mt-3 border-t border-border pt-3 text-xs text-muted-foreground">
                {spotsLeft > 0
                  ? `${spotsLeft} of ${event.capacity} places remaining`
                  : 'This event is at capacity'}
              </p>
            ) : null}
          </div>

          <EventRegistration
            eventId={event.id}
            registrationUrl={event.registrationUrl}
            registrationStatus={
              spotsLeft === 0 && event.registrationStatus === 'OPEN'
                ? 'WAITLIST'
                : event.registrationStatus
            }
            initiallyRegistered={registered}
          />
        </aside>
      </div>
    </>
  );
}
