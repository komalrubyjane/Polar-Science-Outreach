/**
 * Tiny, dependency-free Markdown → HTML renderer.
 *
 * Deliberately limited to a safe subset (headings, bold, italic, inline code,
 * links, unordered/ordered lists, blockquotes, paragraphs, horizontal rules).
 * All input is HTML-escaped first, so the output is safe to inject with
 * `dangerouslySetInnerHTML`. Links are forced to `rel="noopener nofollow"`.
 */

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function inline(text: string): string {
  let out = escapeHtml(text);
  out = out.replace(/`([^`]+)`/g, '<code>$1</code>');
  out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  out = out.replace(/(^|[^*])\*([^*]+)\*/g, '$1<em>$2</em>');
  out = out.replace(
    /\[([^\]]+)\]\((https?:\/\/[^\s)]+|\/[^\s)]*)\)/g,
    (_m, label: string, href: string) => {
      const external = href.startsWith('http');
      return `<a href="${href}"${
        external ? ' target="_blank" rel="noopener nofollow"' : ''
      }>${label}</a>`;
    },
  );
  return out;
}

export function renderMarkdown(src: string): string {
  const lines = src.replace(/\r\n/g, '\n').split('\n');
  const html: string[] = [];
  let listType: 'ul' | 'ol' | null = null;
  let paragraph: string[] = [];
  let inQuote = false;

  const flushParagraph = () => {
    if (paragraph.length) {
      html.push(`<p>${inline(paragraph.join(' '))}</p>`);
      paragraph = [];
    }
  };
  const closeList = () => {
    if (listType) {
      html.push(`</${listType}>`);
      listType = null;
    }
  };
  const closeQuote = () => {
    if (inQuote) {
      html.push('</blockquote>');
      inQuote = false;
    }
  };

  for (const raw of lines) {
    const line = raw.trimEnd();

    if (!line.trim()) {
      flushParagraph();
      closeList();
      closeQuote();
      continue;
    }

    const heading = /^(#{1,4})\s+(.*)$/.exec(line);
    if (heading) {
      flushParagraph();
      closeList();
      closeQuote();
      const level = heading[1]!.length + 1; // start at <h2>
      html.push(`<h${level}>${inline(heading[2]!)}</h${level}>`);
      continue;
    }

    if (/^(-{3,}|\*{3,})$/.test(line)) {
      flushParagraph();
      closeList();
      closeQuote();
      html.push('<hr />');
      continue;
    }

    const ol = /^\d+\.\s+(.*)$/.exec(line);
    const ul = /^[-*]\s+(.*)$/.exec(line);
    if (ol || ul) {
      flushParagraph();
      closeQuote();
      const wanted = ol ? 'ol' : 'ul';
      if (listType !== wanted) {
        closeList();
        html.push(`<${wanted}>`);
        listType = wanted;
      }
      html.push(`<li>${inline((ol ?? ul)![1]!)}</li>`);
      continue;
    }

    if (/^>\s?/.test(line)) {
      flushParagraph();
      closeList();
      if (!inQuote) {
        html.push('<blockquote>');
        inQuote = true;
      }
      html.push(`<p>${inline(line.replace(/^>\s?/, ''))}</p>`);
      continue;
    }

    closeList();
    closeQuote();
    paragraph.push(line.trim());
  }

  flushParagraph();
  closeList();
  closeQuote();
  return html.join('\n');
}

/** Approximate reading time in minutes. */
export function readingTime(src: string): number {
  const words = src.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 220));
}
