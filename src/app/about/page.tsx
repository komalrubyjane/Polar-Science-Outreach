import type { Metadata } from 'next';
import Link from 'next/link';
import { Target, Eye, ListChecks, Handshake } from 'lucide-react';
import { PageHero } from '@/components/content/page-hero';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SITE } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'About',
  description:
    'About the Integrated Polar Science Outreach, Knowledge Repository and Media Dissemination Portal — mission, vision, objectives, partners and policies.',
};

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About"
        title="About the portal"
        description={SITE.longName}
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'About' }]}
      />
      <div className="container-page space-y-14 py-10">
        <section className="max-w-3xl">
          <p className="text-lg leading-relaxed text-foreground/90">
            This portal is a centralized digital platform for polar science, environmental
            monitoring, scientific education, public outreach, knowledge preservation and
            multimedia dissemination. It brings together research, data, media, expeditions,
            events and educational resources from across the Arctic and Antarctic and makes them
            discoverable, searchable and understandable.
          </p>
          <p className="mt-4 rounded-lg border border-border bg-card p-4 text-sm text-muted-foreground">
            The portal is a <strong>dissemination and information platform</strong>. It is not
            necessarily the original producer of the data or research it presents. Every record
            carries its own source, publisher, licence and — where available — methodology.
            Demonstration content (some institutions, researcher profiles and datasets) is
            fictional and clearly labelled as demo/sample.
          </p>
        </section>

        <section className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-accent" /> Mission
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              To make polar science accessible, reusable and engaging for researchers, students,
              educators, communicators and the public — connecting people to trustworthy
              knowledge about the changing poles.
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-accent" /> Vision
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              A world where polar research is openly shared, well-preserved, and understood
              widely enough to inform good decisions about our common climate future.
            </CardContent>
          </Card>
        </section>

        <section>
          <h2 className="mb-4 flex items-center gap-2 font-display text-2xl font-semibold">
            <ListChecks className="h-6 w-6 text-accent" /> Objectives
          </h2>
          <ul className="grid gap-3 sm:grid-cols-2">
            {[
              'Aggregate polar research, datasets and media in one searchable repository',
              'Preserve knowledge with strong provenance and citation support',
              'Provide plain-language education and outreach materials',
              'Visualise polar environmental indicators with clear sourcing',
              'Support a review workflow so contributed content is quality-checked',
              'Offer open APIs so other tools can build on the catalogue',
            ].map((o) => (
              <li key={o} className="rounded-lg border border-border bg-card p-4 text-sm">
                {o}
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="mb-4 flex items-center gap-2 font-display text-2xl font-semibold">
            <Handshake className="h-6 w-6 text-accent" /> Partners &amp; institutions
          </h2>
          <p className="text-sm text-muted-foreground">
            Institutions and researchers featured on this demonstration deployment are fictional
            and used only to illustrate the platform. In a production deployment this section
            would list real partner organisations and data providers. Browse the{' '}
            <Link href="/institutions" className="text-accent hover:underline">
              institution directory
            </Link>{' '}
            and{' '}
            <Link href="/researchers" className="text-accent hover:underline">
              researcher directory
            </Link>
            .
          </p>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            ['Contact', '/about/contact'],
            ['Data policy', '/about/data-policy'],
            ['Privacy policy', '/about/privacy'],
            ['Terms of use', '/about/terms'],
            ['Accessibility', '/about/accessibility'],
            ['Copyright', '/about/data-policy#copyright'],
          ].map(([label, href]) => (
            <Link
              key={href}
              href={href}
              className="rounded-lg border border-border bg-card p-4 text-sm font-medium hover:border-accent hover:text-accent"
            >
              {label}
            </Link>
          ))}
        </section>
      </div>
    </>
  );
}
