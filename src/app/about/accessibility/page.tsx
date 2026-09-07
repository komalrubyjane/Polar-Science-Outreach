import type { Metadata } from 'next';
import { LegalPage } from '@/components/content/legal-page';

export const metadata: Metadata = { title: 'Accessibility' };

export default function AccessibilityPage() {
  return (
    <LegalPage title="Accessibility" updated="2026-09-01">
      <p>
        We aim to meet <strong>WCAG 2.2 AA</strong>. The platform is built with semantic HTML,
        keyboard-operable controls, visible focus states, sufficient colour contrast in both
        light and dark themes, and a skip-to-content link.
      </p>
      <h2>Specific measures</h2>
      <ul>
        <li>All images require alternative text; media records store an alt-text field.</li>
        <li>Videos support caption tracks; audio records include a transcript field.</li>
        <li>
          Charts include a textual summary and an expandable data table so the information is not
          conveyed by colour or shape alone.
        </li>
        <li>
          The interactive map provides an equivalent accessible list of every visible location.
        </li>
        <li>Colour is never the only means of conveying status — labels and icons accompany it.</li>
        <li>Motion respects <code>prefers-reduced-motion</code>.</li>
      </ul>
      <h2>Feedback</h2>
      <p>
        If you encounter a barrier, please tell us via the <a href="/about/contact">contact
        page</a> and we will prioritise a fix.
      </p>
    </LegalPage>
  );
}
