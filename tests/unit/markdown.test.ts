import { describe, it, expect } from 'vitest';
import { renderMarkdown, readingTime } from '@/lib/markdown';

describe('renderMarkdown', () => {
  it('escapes raw HTML to prevent XSS', () => {
    const out = renderMarkdown('<script>alert(1)</script> hello');
    expect(out).not.toContain('<script>');
    expect(out).toContain('&lt;script&gt;');
  });

  it('renders headings starting at h2', () => {
    expect(renderMarkdown('# Title')).toContain('<h2>Title</h2>');
    expect(renderMarkdown('## Sub')).toContain('<h3>Sub</h3>');
  });

  it('renders bold, italic and inline code', () => {
    const out = renderMarkdown('This is **bold**, *italic* and `code`.');
    expect(out).toContain('<strong>bold</strong>');
    expect(out).toContain('<em>italic</em>');
    expect(out).toContain('<code>code</code>');
  });

  it('renders unordered and ordered lists', () => {
    expect(renderMarkdown('- a\n- b')).toContain('<ul>');
    expect(renderMarkdown('1. a\n2. b')).toContain('<ol>');
  });

  it('adds rel="noopener nofollow" to external links only', () => {
    const ext = renderMarkdown('[x](https://example.org)');
    expect(ext).toContain('rel="noopener nofollow"');
    const int = renderMarkdown('[x](/repository)');
    expect(int).toContain('href="/repository"');
    expect(int).not.toContain('nofollow');
  });
});

describe('readingTime', () => {
  it('returns at least one minute', () => {
    expect(readingTime('a few words')).toBe(1);
  });
  it('scales with length', () => {
    expect(readingTime('word '.repeat(660))).toBe(3);
  });
});
