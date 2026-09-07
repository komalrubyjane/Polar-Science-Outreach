import 'server-only';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { env } from '../env';
import type {
  GetObjectResult,
  PutObjectInput,
  StorageProvider,
  StoredObject,
} from './types';

/**
 * Filesystem-backed storage for local development and single-node deployments.
 * Objects live under LOCAL_STORAGE_DIR. Nothing here is web-served directly —
 * files are streamed through `/api/files/[...key]` which enforces access rules.
 */
export class LocalStorageProvider implements StorageProvider {
  readonly name = 'local';
  private readonly root: string;

  constructor(root = env.LOCAL_STORAGE_DIR) {
    this.root = path.resolve(process.cwd(), root);
  }

  private resolve(key: string): string {
    const safe = key.replace(/\\/g, '/').replace(/\.\.+/g, '').replace(/^\/+/, '');
    const full = path.resolve(this.root, safe);
    if (!full.startsWith(this.root)) {
      throw new Error('Resolved path escapes storage root');
    }
    return full;
  }

  async put(input: PutObjectInput): Promise<StoredObject> {
    const dest = this.resolve(input.key);
    await fs.mkdir(path.dirname(dest), { recursive: true });
    await fs.writeFile(dest, input.body);
    return {
      key: input.key,
      size: input.body.byteLength,
      contentType: input.contentType,
    };
  }

  async get(key: string): Promise<GetObjectResult> {
    const src = this.resolve(key);
    const body = await fs.readFile(src);
    return {
      body,
      size: body.byteLength,
      contentType: 'application/octet-stream',
    };
  }

  async delete(key: string): Promise<void> {
    try {
      await fs.unlink(this.resolve(key));
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code !== 'ENOENT') throw err;
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      await fs.access(this.resolve(key));
      return true;
    } catch {
      return false;
    }
  }

  publicUrl(key: string): string {
    // Everything is proxied so the auth check always runs.
    return `/api/files/${key.split('/').map(encodeURIComponent).join('/')}`;
  }
}
