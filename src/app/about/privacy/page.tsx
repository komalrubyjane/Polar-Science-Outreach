import type { Metadata } from 'next';
import { LegalPage } from '@/components/content/legal-page';

export const metadata: Metadata = { title: 'Privacy Policy' };

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy policy" updated="2026-09-01">
      <h2>What we collect</h2>
      <p>
        <strong>Account data.</strong> If you register, we store your name, email address and a
        salted password hash. We never store your password in plain text.
      </p>
      <p>
        <strong>Analytics.</strong> With your consent we record anonymous product-analytics
        events (page views, searches, resource views, downloads). These contain no name, email or
        account identifier. IP addresses are never stored with analytics events; where an IP is
        needed for security (rate limiting, audit logs) it is stored only as a keyed hash.
      </p>
      <p>
        <strong>Newsletter.</strong> If you subscribe, we store your email address and a
        confirmation token until you unsubscribe.
      </p>
      <h2>Cookies</h2>
      <p>
        We use a single first-party cookie to remember your analytics choice, plus the
        session cookie required to keep you signed in. No third-party tracking cookies are set.
        You can decline analytics at any time from the banner or by clearing the cookie.
      </p>
      <h2>Your rights</h2>
      <p>
        You can edit or delete your profile from your account settings. To request full deletion
        of your account and associated activity, contact us via the{' '}
        <a href="/about/contact">contact page</a>.
      </p>
      <h2>Data retention</h2>
      <p>
        Analytics events are retained in aggregate. Audit logs are retained for security and
        accountability. Account data is retained until you delete your account.
      </p>
      <h2>Logging</h2>
      <p>
        Server logs are structured and deliberately exclude passwords, tokens, secrets and
        personal identifiers.
      </p>
    </LegalPage>
  );
}
