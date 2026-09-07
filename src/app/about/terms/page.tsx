import type { Metadata } from 'next';
import { LegalPage } from '@/components/content/legal-page';

export const metadata: Metadata = { title: 'Terms of Use' };

export default function TermsPage() {
  return (
    <LegalPage title="Terms of use" updated="2026-09-01">
      <h2>Acceptable use</h2>
      <p>
        You may browse, search and download content in accordance with each item&apos;s stated
        licence. Do not attempt to disrupt the service, bypass access controls, scrape at a rate
        that degrades performance, or upload malicious files.
      </p>
      <h2>Content &amp; licences</h2>
      <p>
        Each research record, dataset and media asset carries its own licence. Respect it. Where
        content is marked “All rights reserved”, downloading or redistribution is not permitted
        without the rights-holder&apos;s consent.
      </p>
      <h2>Contributions</h2>
      <p>
        If you submit content, you confirm you have the right to share it and grant the portal a
        licence to host and display it. Submissions are reviewed before publication and may be
        edited or declined.
      </p>
      <h2>Accuracy &amp; provenance</h2>
      <p>
        The portal disseminates third-party research and data. We make reasonable efforts to
        preserve provenance but do not warrant the accuracy of every record. Demonstration
        content is fictional and labelled as such.
      </p>
      <h2>Liability</h2>
      <p>
        The service is provided “as is”. To the maximum extent permitted by law, the operators
        are not liable for any loss arising from use of the platform or reliance on its content.
      </p>
    </LegalPage>
  );
}
