import 'server-only';
import crypto from 'node:crypto';
import { env } from '../env';
import { LocalStorageProvider } from './local';
import { S3StorageProvider } from './s3';
import type { StorageProvider } from './types';

export type { StorageProvider } from './types';

let instance: StorageProvider | null = null;

export function getStorage(): StorageProvider {
  if (instance) return instance;
  instance = env.STORAGE_PROVIDER === 's3' ? new S3StorageProvider() : new LocalStorageProvider();
  return instance;
}

// ---------------------------------------------------------------------------
// Upload validation
// ---------------------------------------------------------------------------

export const MAX_UPLOAD_BYTES = 100 * 1024 * 1024; // 100 MB hard ceiling

/** Allowed MIME types keyed by logical category, with per-category size caps. */
export const UPLOAD_RULES = {
  image: {
    mimes: ['image/jpeg', 'image/png', 'image/webp', 'image/avif'],
    exts: ['.jpg', '.jpeg', '.png', '.webp', '.avif'],
    maxBytes: 20 * 1024 * 1024,
  },
  video: {
    mimes: ['video/mp4', 'video/webm'],
    exts: ['.mp4', '.webm'],
    maxBytes: 100 * 1024 * 1024,
  },
  audio: {
    mimes: ['audio/mpeg', 'audio/wav', 'audio/x-wav', 'audio/webm'],
    exts: ['.mp3', '.wav', '.weba'],
    maxBytes: 60 * 1024 * 1024,
  },
  document: {
    mimes: ['application/pdf'],
    exts: ['.pdf'],
    maxBytes: 40 * 1024 * 1024,
  },
  data: {
    mimes: [
      'text/csv',
      'application/json',
      'application/geo+json',
      'application/vnd.geo+json',
      'text/plain',
    ],
    exts: ['.csv', '.json', '.geojson'],
    maxBytes: 40 * 1024 * 1024,
  },
} as const;

export type UploadCategory = keyof typeof UPLOAD_RULES;

export interface ValidatedUpload {
  category: UploadCategory;
  safeName: string;
  ext: string;
}

export class UploadValidationError extends Error {
  readonly status = 422;
}

/**
 * Validate a file's declared name, MIME type and size against the ruleset.
 * Never trusts the client extension alone — MIME must also match.
 */
export function validateUpload(params: {
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  allow?: UploadCategory[];
}): ValidatedUpload {
  const { originalName, mimeType, sizeBytes } = params;
  const allow = params.allow ?? (Object.keys(UPLOAD_RULES) as UploadCategory[]);

  if (sizeBytes <= 0) throw new UploadValidationError('Empty file');
  if (sizeBytes > MAX_UPLOAD_BYTES) throw new UploadValidationError('File exceeds maximum size');

  const dot = originalName.lastIndexOf('.');
  const ext = dot >= 0 ? originalName.slice(dot).toLowerCase() : '';
  if (!ext) throw new UploadValidationError('File must have an extension');

  let matched: UploadCategory | null = null;
  for (const category of allow) {
    const rule = UPLOAD_RULES[category];
    if (
      (rule.mimes as readonly string[]).includes(mimeType) &&
      (rule.exts as readonly string[]).includes(ext)
    ) {
      matched = category;
      if (sizeBytes > rule.maxBytes) {
        throw new UploadValidationError(
          `${category} files must be ${Math.round(rule.maxBytes / 1024 / 1024)} MB or smaller`,
        );
      }
      break;
    }
  }

  if (!matched) {
    throw new UploadValidationError(
      `Unsupported file type "${mimeType}" (${ext}). Allowed: ${allow.join(', ')}`,
    );
  }

  // Sanitize: strip path components, collapse to a slug + preserved extension.
  const base = originalName
    .slice(0, dot >= 0 ? dot : undefined)
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/^[.-]+/, '')
    .slice(0, 60) || 'file';

  return { category: matched, safeName: `${base}${ext}`, ext };
}

/** Build a collision-resistant storage key. */
export function buildStorageKey(prefix: string, safeName: string): string {
  const stamp = new Date().toISOString().slice(0, 10);
  const rand = crypto.randomBytes(8).toString('hex');
  return `${prefix}/${stamp}/${rand}-${safeName}`;
}

export function sha256(buffer: Buffer | Uint8Array): string {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

/**
 * Virus-scanning integration point. Wire up ClamAV / a cloud scanner here and
 * return the resulting status. The default implementation is a no-op that marks
 * files "skipped" outside production.
 */
export async function scanForViruses(_buffer: Buffer): Promise<'clean' | 'infected' | 'skipped'> {
  return 'skipped';
}
