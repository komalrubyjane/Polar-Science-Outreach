import { describe, it, expect } from 'vitest';
import { validateUpload, buildStorageKey, UploadValidationError } from '@/lib/storage';

describe('validateUpload', () => {
  it('accepts a PDF as a document', () => {
    const v = validateUpload({
      originalName: 'paper.pdf',
      mimeType: 'application/pdf',
      sizeBytes: 1_000_000,
      allow: ['document'],
    });
    expect(v.category).toBe('document');
    expect(v.ext).toBe('.pdf');
  });

  it('rejects a mismatched MIME / extension pair', () => {
    expect(() =>
      validateUpload({
        originalName: 'evil.pdf',
        mimeType: 'application/x-msdownload',
        sizeBytes: 1000,
        allow: ['document'],
      }),
    ).toThrow(UploadValidationError);
  });

  it('rejects files without an extension', () => {
    expect(() =>
      validateUpload({ originalName: 'noext', mimeType: 'application/pdf', sizeBytes: 10 }),
    ).toThrow();
  });

  it('rejects a type not in the allow-list', () => {
    expect(() =>
      validateUpload({
        originalName: 'clip.mp4',
        mimeType: 'video/mp4',
        sizeBytes: 1000,
        allow: ['image'],
      }),
    ).toThrow();
  });

  it('enforces the per-category size cap', () => {
    expect(() =>
      validateUpload({
        originalName: 'huge.png',
        mimeType: 'image/png',
        sizeBytes: 30 * 1024 * 1024,
        allow: ['image'],
      }),
    ).toThrow(/smaller/);
  });

  it('sanitises the stored filename', () => {
    const v = validateUpload({
      originalName: '../../etc/pass wd;.pdf',
      mimeType: 'application/pdf',
      sizeBytes: 1000,
      allow: ['document'],
    });
    expect(v.safeName).not.toContain('/');
    expect(v.safeName).not.toContain('..');
    expect(v.safeName.endsWith('.pdf')).toBe(true);
  });
});

describe('buildStorageKey', () => {
  it('namespaces by prefix and date and stays unique', () => {
    const a = buildStorageKey('image/media', 'photo.png');
    const b = buildStorageKey('image/media', 'photo.png');
    expect(a).not.toBe(b);
    expect(a.startsWith('image/media/')).toBe(true);
    expect(a.endsWith('photo.png')).toBe(true);
  });
});
