# Deployment

Two supported paths. Both need: a PostgreSQL database, an `AUTH_SECRET`, and
(for uploads in production) S3-compatible storage.

---

## Option 1 — Vercel + managed Postgres + S3/R2

1. **Database.** Create a Postgres instance (Supabase, Neon, RDS…).
   - Supabase: use the **pooler** strings. `DATABASE_URL` = *Transaction pooler*
     (`...pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1`);
     `DIRECT_URL` = *Session pooler* (`...:5432/postgres`). The `db.<ref>.supabase.co`
     "Direct connection" host is IPv6-only and will not work from Vercel.
2. **Storage.** Create an S3 or Cloudflare R2 bucket. Note endpoint, region,
   bucket, access key, secret. Optionally put a CDN in front → `S3_PUBLIC_URL`.
3. **Project.** Import the repo into Vercel. Framework preset: Next.js.
4. **Environment variables** (Vercel dashboard → Settings → Environment
   Variables), from `.env.example`:
   - `DATABASE_URL`, `DIRECT_URL`
   - `AUTH_SECRET` (`openssl rand -base64 32`), `AUTH_TRUST_HOST=true`
   - `NEXT_PUBLIC_APP_URL=https://your-domain`
   - `STORAGE_PROVIDER=s3` + all `S3_*`
   - Optionally `GOOGLE_CLIENT_ID/SECRET`, `EMAIL_SERVER`, `EMAIL_FROM`,
     `NEXT_PUBLIC_MAP_TILE_URL`, provider API URLs.
   - Bootstrap: `ADMIN_EMAIL`, `ADMIN_PASSWORD`, etc.
5. **Migrate.** Add a build step or run once from a shell with the prod
   `DATABASE_URL`:
   ```bash
   npx prisma migrate deploy
   npx tsx prisma/seed.ts        # optional: demo content
   ```
   (Or set `"build": "prisma generate && prisma migrate deploy && next build"`.)
6. **Domain & HTTPS.** Add your domain in Vercel; TLS is automatic. Update
   `NEXT_PUBLIC_APP_URL` and, if using Google OAuth, the redirect URI
   `https://your-domain/api/auth/callback/google`.

---

## Option 2 — Docker on a VPS

Prereqs: Docker + Docker Compose, a domain, and a reverse proxy (Caddy / Nginx /
Traefik) terminating TLS.

```bash
git clone <repo> && cd polar-science-portal
export AUTH_SECRET=$(openssl rand -base64 32)
export NEXT_PUBLIC_APP_URL=https://your-domain
export ADMIN_EMAIL=admin@your-domain ADMIN_PASSWORD='a-strong-secret'
SEED_ON_START=true docker compose up -d --build     # first run only
```

- `docker-compose.yml` starts `db` (Postgres 16) and `app` (the built image).
- The entrypoint runs `prisma migrate deploy` (→ `db push` fallback) on start.
- App listens on `:3000`. Put your reverse proxy in front:

```caddy
your-domain {
  reverse_proxy 127.0.0.1:3000
}
```

Caddy obtains and renews TLS automatically. For Nginx, proxy_pass to
`http://127.0.0.1:3000` and manage certs with certbot.

### Production storage in Docker

The compose file uses the `local` provider with a named volume
(`polar_storage`). For real deployments set `STORAGE_PROVIDER=s3` + `S3_*` in the
`app` service environment and drop the volume.

---

## HTTPS / headers

Security headers (`X-Content-Type-Options`, `X-Frame-Options`,
`Referrer-Policy`, `Permissions-Policy`) are set in `next.config.mjs`. Add HSTS at
the proxy. `AUTH_TRUST_HOST=true` is required behind any proxy.

## Logging

Structured single-line JSON to stdout (`src/lib/logger.ts`), secrets/PII redacted.
Ship stdout to your platform's log system (Vercel logs, `docker logs`, Loki,
CloudWatch). Set `LOG_LEVEL=debug|info|warn|error`.

## Monitoring

- **Uptime:** probe `GET /` and `GET /api/search?q=ok` (returns `200` even with an
  empty DB).
- **Errors:** unhandled API errors log `"Unhandled API error"` with a `ref`;
  the client sees only `Internal server error (ref: …)`. Add Sentry by wrapping
  `handle()` and `error.tsx`.
- **DB:** track connection count (keep `connection_limit=1` per serverless
  instance when pooling), slow queries, and disk.
- **Analytics dashboard:** `/admin/analytics` for product signals.

## Backups

See `docs/database.md`. Automate nightly `pg_dump` + media snapshot; test restore
into staging quarterly.

## Pre-flight checklist

- [ ] `npm run build` succeeds
- [ ] `npm run test` passes
- [ ] `prisma migrate deploy` applied
- [ ] `AUTH_SECRET` set (not the dev default), `.env` not committed
- [ ] `NEXT_PUBLIC_APP_URL` matches the real origin
- [ ] `STORAGE_PROVIDER=s3` with working credentials (if uploads are used)
- [ ] Admin password changed after first login
- [ ] TLS + HSTS at the proxy
- [ ] Backups scheduled and a restore tested
