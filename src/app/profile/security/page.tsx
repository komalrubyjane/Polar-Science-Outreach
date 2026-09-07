import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/session';
import { PageHero } from '@/components/content/page-hero';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PasswordChanger } from '@/components/profile/password-changer';

export const metadata: Metadata = { title: 'Security' };
export const dynamic = 'force-dynamic';

export default async function SecurityPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login?callbackUrl=/profile/security');

  return (
    <>
      <PageHero
        eyebrow="Account"
        title="Security"
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Profile', href: '/profile' },
          { label: 'Security' },
        ]}
      />
      <div className="container-page max-w-lg py-10">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Change password</CardTitle>
          </CardHeader>
          <CardContent>
            <PasswordChanger mustChange={user.mustChangePassword} />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
