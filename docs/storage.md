# Storage

## Abstraction

`src/lib/storage/` defines `StorageProvider`:

```ts
put(input): Promise<StoredObject>
get(key): Promise<GetObjectResult>
delete(key): Promise<void>
exists(key): Promise<boolean>
publicUrl(key, isPublic): string
```

`getStorage()` returns a singleton chosen by `STORAGE_PROVIDER`:

- **`local`** (`LocalStorageProvider`) — writes under `LOCAL_STORAGE_DIR`
  (default `./storage`). Nothing is web-served directly; `publicUrl()` always
  returns `/api/files/<key>` so the authorization check runs.
- **`s3`** (`S3StorageProvider`) — S3 / Cloudflare R2 / MinIO / Backblaze B2.
  Implemented with AWS SigV4 over `fetch` (no SDK in the bundle). Configure
  `S3_ENDPOINT`, `S3_REGION`, `S3_BUCKET`, `S3_ACCESS_KEY`, `S3_SECRET_KEY`,
  `S3_FORCE_PATH_STYLE`, and optionally `S3_PUBLIC_URL` (CDN in front of the
  bucket). Public objects get a direct URL; private objects are proxied.

## Upload validation

`validateUpload()` in `src/lib/storage/index.ts` enforces, per logical category:

| Category | MIME types | Extensions | Size cap |
| --- | --- | --- | --- |
| image | jpeg, png, webp, avif | .jpg .jpeg .png .webp .avif | 20 MB |
| video | mp4, webm | .mp4 .webm | 100 MB |
| audio | mpeg, wav, webm | .mp3 .wav .weba | 60 MB |
| document | pdf | .pdf | 40 MB |
| data | csv, json, geojson, plain | .csv .json .geojson | 40 MB |

Rules: non-empty; hard ceiling 100 MB; **MIME and extension must both match** a
rule in the allowed set; the stored filename is sanitised (path components and
`..` stripped, slugified, original extension preserved); the storage key is
`<prefix>/<yyyy-mm-dd>/<random>-<safeName>`.

The upload route (`POST /api/files`) additionally requires `content:submit`
permission, rate-limits per user, computes a SHA-256 checksum, and calls
`scanForViruses()`.

## Virus scanning

`scanForViruses(buffer)` in `src/lib/storage/index.ts` is the integration point.
Default returns `"skipped"`. To enable, call ClamAV (`clamd`) or a cloud scanner
and return `"clean" | "infected" | "skipped"`. `POST /api/files` rejects
`"infected"` with `422`; the result is stored on `FileAsset.scanStatus`.

## Access control

`GET /api/files/<key>` looks up the `FileAsset` by key. Public assets stream with
`Cache-Control: public`. Private assets require an authenticated session and
stream with `private, no-store`. Every fetch writes a `Download` row (with a
keyed IP hash) and a `download` analytics event. Tighten to per-record ACLs by
adding an owner/visibility check in that route.

## Backups

See `docs/database.md` → Backups. Media and the database must be backed up and
restored to the same point in time because `FileAsset` rows reference storage
keys.
