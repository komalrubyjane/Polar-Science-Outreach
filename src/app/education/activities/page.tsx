import type { Metadata } from 'next';
import { PageHero } from '@/components/content/page-hero';
import {
  SeaIceSimulator,
  AlbedoExplainer,
  PolarFoodWeb,
} from '@/components/education/activities';

export const metadata: Metadata = {
  title: 'Interactive Activities',
  description:
    'Hands-on interactive models: a sea ice simulator, an albedo explainer and an Antarctic food web. No account needed.',
};

export default function ActivitiesPage() {
  return (
    <>
      <PageHero
        eyebrow="Education & Outreach"
        title="Interactive activities"
        description="Simple, self-contained models you can explore in the browser. Values shown are illustrative teaching aids, not measurements."
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Education', href: '/education' },
          { label: 'Interactive activities' },
        ]}
      />
      <div className="container-page grid gap-6 py-10 md:grid-cols-2">
        <SeaIceSimulator />
        <AlbedoExplainer />
        <div className="md:col-span-2">
          <PolarFoodWeb />
        </div>
      </div>
    </>
  );
}
