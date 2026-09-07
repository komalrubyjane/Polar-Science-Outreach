import { describe, it, expect } from 'vitest';
import { buildCitations, toApa, toBibtex } from '@/lib/citations';

const base = {
  title: 'Multi-decadal decline of Arctic summer sea ice',
  authors: [{ fullName: 'Aila Nkasi' }, { fullName: 'Mei Tanaka' }],
  year: 2023,
  institution: 'Northern Cryosphere Institute',
  doi: '10.5555/demo.2023.1001',
  url: null,
  slug: 'arctic-sea-ice-decline-1',
  siteName: 'Polar Science Portal',
};

describe('citations', () => {
  it('APA lists authors surname-first with initials and includes the DOI', () => {
    const apa = toApa(base);
    expect(apa).toContain('Nkasi, A.');
    expect(apa).toContain('(2023)');
    expect(apa).toContain('https://doi.org/10.5555/demo.2023.1001');
  });

  it('APA handles no authors with an organisational author', () => {
    const apa = toApa({ ...base, authors: [] });
    expect(apa).toContain('Polar Science Portal');
  });

  it('BibTeX produces a parseable entry with a key and required fields', () => {
    const bib = toBibtex(base);
    expect(bib).toMatch(/^@misc\{[a-z0-9]+,/i);
    expect(bib).toContain('title        = {Multi-decadal decline of Arctic summer sea ice}');
    expect(bib).toContain('author       = {Aila Nkasi and Mei Tanaka}');
    expect(bib.trim().endsWith('}')).toBe(true);
  });

  it('buildCitations returns all four formats', () => {
    const c = buildCitations(base);
    expect(Object.keys(c).sort()).toEqual(['apa', 'bibtex', 'chicago', 'mla']);
    for (const v of Object.values(c)) expect(v.length).toBeGreaterThan(10);
  });

  it('MLA uses "et al" for three or more authors', () => {
    const c = buildCitations({
      ...base,
      authors: [{ fullName: 'A One' }, { fullName: 'B Two' }, { fullName: 'C Three' }],
    });
    expect(c.mla).toContain('et al');
  });
});
