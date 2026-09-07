import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { safe } from '@/lib/safe';
import { auth } from '@/auth';
import { getStorage } from '@/lib/storage';
import { track } from '@/lib/analytics';
import { PageHero } from '@/components/content/page-hero';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataProvenance } from '@/components/ui/misc';
import { MediaViewer } from '@/components/media/media-viewer';
import { BookmarkButton } from '@/components/content/bookmark-button';
import { formatDate } from '@/lib/utils';
import { MEDIA_TYPE_LABELS, LICENSE_LABELS, POLE_LABELS } from '@/lib/constants';

export const dynamic = 'force-dynamic';

async function getMedia(slug: string) {
  return safe(
    () =>
      prisma.media.findFirst({
        where: { slug },
        include: {
          region: { select: { name: true, pole: true } },
          institution: { select: { name: true, slug: true } },
          file: { select: { key: true, isPublic: true, mimeType: true, originalName: true } },
          topics: { include: { topic: { select: { name: true, slug: true } } } },
          tags: { include: { tag: true } },
        },
      }),
    null,
    'mediaDetail',
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const m = await getMedia(slug);
  if (!m) return { title: 'Media not found' };
  return {
    title: m.title,
    description: m.description?.slice(0, 200) ?? `${MEDIA_TYPE_LABELS[m.type]} — ${m.title}`,
    openGraph: { images: m.thumbnailUrl ? [m.thumbnailUrl] : undefined },
  };
}

export default async function MediaDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const media = await getMedia(slug);
  if (!media) notFound();

  const session = await auth();
  if (media.status !== 'PUBLISHED' && !['EDITOR', 'ADMIN'].includes(session?.user?.role ?? '')) {
    notFound();
  }

  void prisma.media
    .update({ where: { id: media.id }, data: { viewCount: { increment: 1 } } })
    .catch(() => undefined);
  void track({ type: 'media_view', entityType: 'Media', entityId: media.id });

  const storage = getStorage();
  const fileSrc = media.file ? storage.publicUrl(media.file.key, media.file.isPublic) : null;
  const canDownload =
    media.file && media.license !== 'ALL_RIGHTS_RESERVED' ? fileSrc : null;

  const bookmarked = session?.user?.id
    ? await safe(
        () =>
          prisma.bookmark
            .findUnique({
              where: {
                userId_entityType_entityId: {
                  userId: session!.user!.id,
                  entityType: 'MEDIA',
                  entityId: media.id,
                },
              },
            })
            .then(Boolean),
        false,
        'mediaBookmark',
      )
    : false;

  return (
    <>
      <PageHero
        eyebrow={MEDIA_TYPE_LABELS[media.type]}
        title={media.title}
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Media', href: '/media' },
          { label: media.title },
        ]}
      >
        <div className="flex flex-wrap gap-1.5">
          {media.region ? <Badge variant="accent">{POLE_LABELS[media.region.pole]}</Badge> : null}
          <Badge variant="outline">{LICENSE_LABELS[media.license] ?? media.license}</Badge>
          {media.isDemo ? <Badge variant="demo">Demo content</Badge> : null}
        </div>
      </PageHero>

      <div className="container-page grid gap-10 py-10 lg:grid-cols-[1fr_320px]">
        <div>
          <MediaViewer
            type={media.type}
            src={fileSrc}
            externalUrl={media.externalUrl}
            title={media.title}
            altText={media.altText}
            captionsUrl={media.captionsUrl}
            poster={media.thumbnailUrl}
          />

          <div className="mt-4 flex flex-wrap gap-2">
            <BookmarkButton entityType="MEDIA" entityId={media.id} initialBookmarked={bookmarked} />
            {canDownload ? (
              <Button asChild>
                <a href={canDownload} download>
                  Download original
                </a>
              </Button>
            ) : null}
          </div>

          {media.description ? (
            <p className="mt-6 leading-relaxed text-foreground/90">{media.description}</p>
          ) : null}

          {media.transcript ? (
            <section className="mt-8">
              <h2 className="mb-2 font-display text-lg font-semibold">
                {media.type === 'AUDIO' ? 'Transcript' : 'Text / captions'}
              </h2>
              <div className="whitespace-pre-wrap rounded-lg border border-border bg-card p-4 text-sm leading-relaxed">
                {media.transcript}
              </div>
            </section>
          ) : null}

          {media.topics.length ? (
            <div className="mt-6 flex flex-wrap gap-1.5">
              {media.topics.map((t) => (
                <Link
                  key={t.topic.slug}
                  href={`/explore/${t.topic.slug}`}
                  className="rounded-full border border-border px-3 py-1 text-xs hover:border-accent hover:text-accent"
                >
                  {t.topic.name}
                </Link>
              ))}
            </div>
          ) : null}
        </div>

        <aside className="space-y-5">
          <div className="rounded-xl border border-border bg-card p-4 text-sm">
            <h2 className="mb-3 font-display text-base font-semibold">Metadata</h2>
            <dl className="space-y-2">
              <Meta label="Type" value={MEDIA_TYPE_LABELS[media.type]} />
              <Meta label="Creator" value={media.creator ?? '—'} />
              <Meta label="Institution" value={media.institution?.name ?? '—'} />
              <Meta label="Captured" value={formatDate(media.capturedAt)} />
              <Meta label="Location" value={media.locationName ?? '—'} />
              <Meta
                label="Coordinates"
                value={
                  media.latitude != null && media.longitude != null
                    ? `${media.latitude.toFixed(3)}°, ${media.longitude.toFixed(3)}°`
                    : '—'
                }
              />
              <Meta label="Copyright" value={media.copyright ?? '—'} />
              <Meta label="Licence" value={LICENSE_LABELS[media.license] ?? media.license} />
              <Meta label="Attribution" value={media.attribution ?? '—'} />
              {media.durationSec ? (
                <Meta
                  label="Duration"
                  value={`${Math.floor(media.durationSec / 60)}m ${media.durationSec % 60}s`}
                />
              ) : null}
            </dl>
          </div>

          <DataProvenance
            source={media.creator ?? media.institution?.name ?? 'Contributor'}
            publisher={media.institution?.name ?? null}
            lastUpdated={formatDate(media.updatedAt)}
            license={LICENSE_LABELS[media.license] ?? media.license}
            isDemo={media.isDemo}
          />
        </aside>
      </div>
    </>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium">{value}</dd>
    </div>
  );
}
