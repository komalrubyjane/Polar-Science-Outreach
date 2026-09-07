/**
 * Citation generation for repository records.
 * Supports APA 7, MLA 9, Chicago (author-date) and BibTeX.
 */

export interface CitationAuthor {
  fullName: string;
}

export interface CitationInput {
  title: string;
  authors: CitationAuthor[];
  year?: number | null;
  institution?: string | null;
  doi?: string | null;
  url?: string | null;
  publisher?: string | null;
  slug: string;
  siteName?: string;
}

function splitName(fullName: string): { last: string; firsts: string[] } {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return { last: parts[0]!, firsts: [] };
  const last = parts[parts.length - 1]!;
  return { last, firsts: parts.slice(0, -1) };
}

function initials(firsts: string[]): string {
  return firsts.map((f) => `${f[0]!.toUpperCase()}.`).join(' ');
}

function apaAuthors(authors: CitationAuthor[]): string {
  if (authors.length === 0) return 'Polar Science Portal';
  const formatted = authors.map((a) => {
    const { last, firsts } = splitName(a.fullName);
    return firsts.length ? `${last}, ${initials(firsts)}` : last;
  });
  if (formatted.length === 1) return formatted[0]!;
  if (formatted.length <= 20) {
    return `${formatted.slice(0, -1).join(', ')}, & ${formatted[formatted.length - 1]}`;
  }
  return `${formatted.slice(0, 19).join(', ')}, … ${formatted[formatted.length - 1]}`;
}

function mlaAuthors(authors: CitationAuthor[]): string {
  if (authors.length === 0) return 'Polar Science Portal';
  const first = splitName(authors[0]!.fullName);
  const firstStr = first.firsts.length
    ? `${first.last}, ${first.firsts.join(' ')}`
    : first.last;
  if (authors.length === 1) return firstStr;
  if (authors.length === 2) return `${firstStr}, and ${authors[1]!.fullName}`;
  return `${firstStr}, et al`;
}

export function toApa(c: CitationInput): string {
  const year = c.year ? `(${c.year})` : '(n.d.)';
  const src = c.publisher || c.institution || c.siteName || 'Polar Science Portal';
  const locator = c.doi
    ? `https://doi.org/${c.doi}`
    : c.url || `${c.siteName ?? 'Polar Science Portal'} — /repository/${c.slug}`;
  return `${apaAuthors(c.authors)}. ${year}. ${c.title}. ${src}. ${locator}`.replace(/\s+/g, ' ').trim();
}

export function toMla(c: CitationInput): string {
  const src = c.publisher || c.institution || c.siteName || 'Polar Science Portal';
  const year = c.year ?? 'n.d.';
  const locator = c.doi ? `doi:${c.doi}` : c.url || `/repository/${c.slug}`;
  return `${mlaAuthors(c.authors)}. "${c.title}." ${src}, ${year}, ${locator}.`.replace(/\s+/g, ' ').trim();
}

export function toChicago(c: CitationInput): string {
  const authors =
    c.authors.length === 0
      ? 'Polar Science Portal'
      : c.authors.map((a, i) => {
          if (i === 0) {
            const { last, firsts } = splitName(a.fullName);
            return firsts.length ? `${last}, ${firsts.join(' ')}` : last;
          }
          return a.fullName;
        }).join(', ');
  const year = c.year ?? 'n.d.';
  const src = c.publisher || c.institution || c.siteName || 'Polar Science Portal';
  const locator = c.doi ? `https://doi.org/${c.doi}` : c.url || `/repository/${c.slug}`;
  return `${authors}. ${year}. "${c.title}." ${src}. ${locator}.`.replace(/\s+/g, ' ').trim();
}

export function toBibtex(c: CitationInput): string {
  const first = c.authors[0] ? splitName(c.authors[0].fullName).last.toLowerCase() : 'polar';
  const key = `${first}${c.year ?? 'nd'}${c.slug.split('-')[0]}`.replace(/[^a-z0-9]/gi, '');
  const authorField =
    c.authors.length > 0 ? c.authors.map((a) => a.fullName).join(' and ') : 'Polar Science Portal';
  const lines = [
    `@misc{${key},`,
    `  title        = {${c.title}},`,
    `  author       = {${authorField}},`,
    c.year ? `  year         = {${c.year}},` : null,
    c.publisher || c.institution
      ? `  howpublished = {${c.publisher || c.institution}},`
      : null,
    c.doi ? `  doi          = {${c.doi}},` : null,
    `  url          = {${c.doi ? `https://doi.org/${c.doi}` : c.url || `/repository/${c.slug}`}},`,
    `  note         = {Accessed via ${c.siteName ?? 'Polar Science Portal'}}`,
    `}`,
  ].filter(Boolean);
  return lines.join('\n');
}

export function buildCitations(c: CitationInput) {
  return {
    apa: toApa(c),
    mla: toMla(c),
    chicago: toChicago(c),
    bibtex: toBibtex(c),
  };
}
