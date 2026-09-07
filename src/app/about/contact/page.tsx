import type { Metadata } from 'next';
import { LegalPage } from '@/components/content/legal-page';

export const metadata: Metadata = { title: 'Contact' };

export default function ContactPage() {
  return (
    <LegalPage title="Contact">
      <p>
        This is a demonstration deployment. In production, this page would carry the operating
        organisation&apos;s contact details, a support address and a media-enquiries route.
      </p>
      <h2>General enquiries</h2>
      <p>
        Email: <code>info@example.org</code>
      </p>
      <h2>Accessibility issues</h2>
      <p>
        Email: <code>accessibility@example.org</code> — we aim to respond within five working
        days.
      </p>
      <h2>Contributing content</h2>
      <p>
        Researchers with an account can submit research, datasets and expedition updates directly
        through the <a href="/submit">submission workflow</a>. Editors review every submission
        before it is published.
      </p>
      <h2>Report a data issue</h2>
      <p>
        If a record has an incorrect source, licence or citation, email{' '}
        <code>data@example.org</code> with the record URL.
      </p>
    </LegalPage>
  );
}
