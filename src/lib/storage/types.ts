export interface PutObjectInput {
  key: string;
  body: Buffer | Uint8Array;
  contentType: string;
  /** When true the object may be served without an auth check. */
  isPublic?: boolean;
}

export interface StoredObject {
  key: string;
  size: number;
  contentType: string;
}

export interface GetObjectResult {
  body: Buffer;
  contentType: string;
  size: number;
}

/**
 * Storage abstraction. Concrete implementations: `LocalStorageProvider`
 * (filesystem, dev) and `S3StorageProvider` (S3 / R2 / MinIO, production).
 */
export interface StorageProvider {
  readonly name: string;
  put(input: PutObjectInput): Promise<StoredObject>;
  get(key: string): Promise<GetObjectResult>;
  delete(key: string): Promise<void>;
  exists(key: string): Promise<boolean>;
  /**
   * A URL the browser can use directly. For private objects this returns an
   * app route (`/api/files/...`) that performs an authorization check.
   */
  publicUrl(key: string, isPublic: boolean): string;
}
