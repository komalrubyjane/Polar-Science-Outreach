import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Bookmark, Download, CalendarCheck, FileUp } from 'lucide-react';
import { prisma } from '@/lib/db';
import { safe } from '@/lib/safe';
import { getCurrentUser } from '@/lib/auth/session';
import { PageHero } from '@/components/content/page-hero';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ProfileEditor } from '@/components/profile/profile-editor';
import { EmptyState } from '@/components/ui/misc';
import { formatDate, formatNumber } from '@/lib/utils';

export const metadata: Metadata = { title: 'Your profile' };
export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login?callbackUrl=/profile');

  const [full, registrations, downloads] = await Promise.all([
    safe(
      () =>
        prisma.user.findUnique({
          where: { id: user.id },
          select: {
            name: true, email: true, bio: true, organization: true, role: true, createdAt: true,
            _count: { select: { bookmarks: true, downloads: true, eventRegistrations: true, submissions: true } },
          },
        }),
      null,
      'profileUser',
    ),
    safe(
      () =>
        prisma.eventRegistration.findMany({
          where: { userId: user.id },
          orderBy: { createdAt: 'desc' },
          include: { event: { select: { slug: true, title: true, startAt: true } } },
        }),
      [],
      'profileRegs',
    ),
    safe(
      () =>
        prisma.download.findMany({
          where: { userId: user.id },
          orderBy: { createdAt: 'desc' },
          take: 25,
          include: { file: { select: { originalName: true, mimeType: true } } },
        }),
      [],
      'profileDownloads',
    ),
  ]);

  const bookmarks = await safe(
    () => prisma.bookmark.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'desc' } }),
    [],
    'profileBookmarks',
  );

  // Resolve bookmark targets by type.
  const byType = (t: string) => bookmarks.filter((b) => b.entityType === t).map((b) => b.entityId);
  const [savedResearch, savedMedia, savedEducation] = await Promise.all([
    safe(
      () =>
        prisma.research.findMany({
          where: { id: { in: byType('RESEARCH') } },
          select: { id: true, slug: true, title: true },
        }),
      [],
      'savedResearch',
    ),
    safe(
      () =>
        prisma.media.findMany({
          where: { id: { in: byType('MEDIA') } },
          select: { id: true, slug: true, title: true },
        }),
      [],
      'savedMedia',
    ),
    safe(
      () =>
        prisma.educationResource.findMany({
          where: { id: { in: byType('EDUCATION') } },
          select: { id: true, slug: true, title: true },
        }),
      [],
      'savedEducation',
    ),
  ]);

  const counts = full?._count ?? { bookmarks: 0, downloads: 0, eventRegistrations: 0, submissions: 0 };

  return (
    <>
      <PageHero
        eyebrow="Account"
        title={full?.name ?? 'Your profile'}
        description={`${user.email} · role: ${user.role}`}
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Profile' }]}
      />
      <div className="container-page py-10">
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={Bookmark} label="Bookmarks" value={counts.bookmarks} href="/bookmarks" />
          <StatCard icon={CalendarCheck} label="Event registrations" value={counts.eventRegistrations} />
          <StatCard icon={Download} label="Downloads" value={counts.downloads} />
          <StatCard icon={FileUp} label="Submissions" value={counts.submissions} href="/submit" />
        </div>

        <Tabs defaultValue="saved">
          <TabsList className="flex-wrap">
            <TabsTrigger value="saved">Saved</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="downloads">Downloads</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="saved" className="space-y-8">
            <SavedList title="Saved research" base="/repository" items={savedResearch} />
            <SavedList title="Saved media" base="/media" items={savedMedia} />
            <SavedList title="Saved education resources" base="/education" items={savedEducation} />
          </TabsContent>

          <TabsContent value="events">
            {registrations.length ? (
              <ul className="divide-y divide-border rounded-xl border border-border bg-card">
                {registrations.map((r) => (
                  <li key={r.id} className="flex items-center justify-between px-4 py-3">
                    <Link href={`/events/${r.event.slug}`} className="font-medium hover:text-accent">
                      {r.event.title}
                    </Link>
                    <span className="text-sm text-muted-foreground">
                      {formatDate(r.event.startAt)}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState title="No event registrations" description="Browse events and register to see them here." />
            )}
          </TabsContent>

          <TabsContent value="downloads">
            {downloads.length ? (
              <ul className="divide-y divide-border rounded-xl border border-border bg-card">
                {downloads.map((d) => (
                  <li key={d.id} className="flex items-center justify-between px-4 py-3 text-sm">
                    <span>{d.file?.originalName ?? d.entityType}</span>
                    <span className="text-muted-foreground">{formatDate(d.createdAt)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState title="No downloads yet" />
            )}
          </TabsContent>

          <TabsContent value="settings">
            <div className="grid gap-8 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Profile details</CardTitle>
                </CardHeader>
                <CardContent>
                  <ProfileEditor
                    initial={{
                      name: full?.name ?? '',
                      bio: full?.bio ?? '',
                      organization: full?.organization ?? '',
                    }}
                  />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Security</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  <p>
                    Member since {formatDate(full?.createdAt)}. Manage your password on the{' '}
                    <Link href="/profile/security" className="text-accent hover:underline">
                      security page
                    </Link>
                    .
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  href?: string;
}) {
  const inner = (
    <div className="rounded-xl border border-border bg-card p-5">
      <Icon className="mb-2 h-5 w-5 text-accent" />
      <p className="font-display text-2xl font-semibold">{formatNumber(value)}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}

function SavedList({
  title,
  base,
  items,
}: {
  title: string;
  base: string;
  items: { id: string; slug: string; title: string }[];
}) {
  return (
    <section>
      <h3 className="mb-2 font-display text-lg font-semibold">{title}</h3>
      {items.length ? (
        <ul className="divide-y divide-border rounded-xl border border-border bg-card">
          {items.map((i) => (
            <li key={i.id} className="px-4 py-3">
              <Link href={`${base}/${i.slug}`} className="hover:text-accent">
                {i.title}
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground">Nothing saved here yet.</p>
      )}
    </section>
  );
}
