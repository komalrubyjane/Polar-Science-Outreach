import 'server-only';
import crypto from 'node:crypto';
import { env } from '../env';
import type {
  GetObjectResult,
  PutObjectInput,
  StorageProvider,
  StoredObject,
} from './types';

/**
 * S3-compatible storage (AWS S3, Cloudflare R2, MinIO, Backblaze B2).
 *
 * Implemented with AWS Signature V4 over `fetch` so no heavy SDK is pulled into
 * the bundle. Configure via S3_* env vars. `publicUrl` returns a direct object
 * URL for public objects (or S3_PUBLIC_URL when the bucket is CDN-fronted) and
 * the proxied `/api/files` route for private ones.
 */
export class S3StorageProvider implements StorageProvider {
  readonly name = 's3';

  private readonly endpoint: string;
  private readonly region: string;
  private readonly bucket: string;
  private readonly accessKey: string;
  private readonly secretKey: string;
  private readonly pathStyle: boolean;

  constructor() {
    if (!env.S3_ENDPOINT || !env.S3_BUCKET || !env.S3_ACCESS_KEY || !env.S3_SECRET_KEY) {
      throw new Error(
        'S3 storage selected but S3_ENDPOINT / S3_BUCKET / S3_ACCESS_KEY / S3_SECRET_KEY are not all set',
      );
    }
    this.endpoint = env.S3_ENDPOINT.replace(/\/$/, '');
    this.region = env.S3_REGION || 'auto';
    this.bucket = env.S3_BUCKET;
    this.accessKey = env.S3_ACCESS_KEY;
    this.secretKey = env.S3_SECRET_KEY;
    this.pathStyle = env.S3_FORCE_PATH_STYLE;
  }

  private objectUrl(key: string): string {
    const encoded = key.split('/').map(encodeURIComponent).join('/');
    return this.pathStyle
      ? `${this.endpoint}/${this.bucket}/${encoded}`
      : `${this.endpoint.replace('://', `://${this.bucket}.`)}/${encoded}`;
  }

  private sign(
    method: string,
    url: URL,
    payload: Buffer,
    extraHeaders: Record<string, string> = {},
  ): Record<string, string> {
    const now = new Date();
    const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '');
    const dateStamp = amzDate.slice(0, 8);
    const service = 's3';
    const payloadHash = crypto.createHash('sha256').update(payload).digest('hex');

    const headers: Record<string, string> = {
      host: url.host,
      'x-amz-content-sha256': payloadHash,
      'x-amz-date': amzDate,
      ...extraHeaders,
    };
    const signedHeaders = Object.keys(headers)
      .map((h) => h.toLowerCase())
      .sort()
      .join(';');
    const canonicalHeaders = Object.keys(headers)
      .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))
      .map((h) => `${h.toLowerCase()}:${headers[h].trim()}\n`)
      .join('');

    const canonicalRequest = [
      method,
      url.pathname,
      url.searchParams.toString(),
      canonicalHeaders,
      signedHeaders,
      payloadHash,
    ].join('\n');

    const scope = `${dateStamp}/${this.region}/${service}/aws4_request`;
    const stringToSign = [
      'AWS4-HMAC-SHA256',
      amzDate,
      scope,
      crypto.createHash('sha256').update(canonicalRequest).digest('hex'),
    ].join('\n');

    const hmac = (key: crypto.BinaryLike | Buffer, data: string) =>
      crypto.createHmac('sha256', key).update(data).digest();
    const kDate = hmac(`AWS4${this.secretKey}`, dateStamp);
    const kRegion = hmac(kDate, this.region);
    const kService = hmac(kRegion, service);
    const kSigning = hmac(kService, 'aws4_request');
    const signature = crypto.createHmac('sha256', kSigning).update(stringToSign).digest('hex');

    return {
      ...headers,
      Authorization: `AWS4-HMAC-SHA256 Credential=${this.accessKey}/${scope}, SignedHeaders=${signedHeaders}, Signature=${signature}`,
    };
  }

  async put(input: PutObjectInput): Promise<StoredObject> {
    const body = Buffer.from(input.body);
    const url = new URL(this.objectUrl(input.key));
    const headers = this.sign('PUT', url, body, {
      'content-type': input.contentType,
      ...(input.isPublic ? { 'x-amz-acl': 'public-read' } : {}),
    });
    const res = await fetch(url, { method: 'PUT', headers, body });
    if (!res.ok) {
      throw new Error(`S3 put failed: ${res.status} ${await res.text()}`);
    }
    return { key: input.key, size: body.byteLength, contentType: input.contentType };
  }

  async get(key: string): Promise<GetObjectResult> {
    const url = new URL(this.objectUrl(key));
    const headers = this.sign('GET', url, Buffer.alloc(0));
    const res = await fetch(url, { method: 'GET', headers });
    if (!res.ok) throw new Error(`S3 get failed: ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    return {
      body: buf,
      size: buf.byteLength,
      contentType: res.headers.get('content-type') ?? 'application/octet-stream',
    };
  }

  async delete(key: string): Promise<void> {
    const url = new URL(this.objectUrl(key));
    const headers = this.sign('DELETE', url, Buffer.alloc(0));
    const res = await fetch(url, { method: 'DELETE', headers });
    if (!res.ok && res.status !== 404) {
      throw new Error(`S3 delete failed: ${res.status}`);
    }
  }

  async exists(key: string): Promise<boolean> {
    const url = new URL(this.objectUrl(key));
    const headers = this.sign('HEAD', url, Buffer.alloc(0));
    const res = await fetch(url, { method: 'HEAD', headers });
    return res.ok;
  }

  publicUrl(key: string, isPublic: boolean): string {
    if (!isPublic) {
      return `/api/files/${key.split('/').map(encodeURIComponent).join('/')}`;
    }
    if (env.S3_PUBLIC_URL) {
      return `${env.S3_PUBLIC_URL.replace(/\/$/, '')}/${key}`;
    }
    return this.objectUrl(key);
  }
}
