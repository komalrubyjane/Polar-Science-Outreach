import type { Metadata } from 'next';
import { LegalPage } from '@/components/content/legal-page';

export const metadata: Metadata = { title: 'Data Policy' };

export default function DataPolicyPage() {
  return (
    <LegalPage title="Data policy" updated="2026-09-01">
      <h2>Provenance first</h2>
      <p>
        Wherever the portal displays scientific data it shows the source, dataset, publisher,
        date, version (where applicable), licence and methodology. The portal is a dissemination
        platform and is <strong>not necessarily the original data producer</strong>. Always cite
        the upstream source.
      </p>
      <h2>Demo &amp; sample data</h2>
      <p>
        When an external scientific data provider is not configured, the data dashboard serves
        clearly-labelled demo datasets generated for interface demonstration. These are{' '}
        <strong>not measurements</strong> and must not be cited. Every demo series is marked with
        a “Demo dataset” badge and an explanatory note.
      </p>
      <h2>External source failures</h2>
      <p>
        If a configured external source is unavailable, the portal shows the most recent cached
        dataset with its “last updated” date and a non-intrusive warning. It never fabricates
        replacement values.
      </p>
      <h2 id="copyright">Copyright</h2>
      <p>
        Research records, datasets and media each carry their own licence and copyright
        statement. Reuse only within those terms. The portal&apos;s own interface, code and
        original explanatory text are released under the repository&apos;s stated open licence
        (see the project README).
      </p>
      <h2>Citations</h2>
      <p>
        Every repository record provides APA, MLA, Chicago and BibTeX citations and a copy /
        download action. Citations reference the upstream DOI or URL where one exists.
      </p>
    </LegalPage>
  );
}
