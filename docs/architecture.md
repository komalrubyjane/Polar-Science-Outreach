# Architecture

## Overview

A single Next.js 15 application (App Router) provides both the UI and the API.
It talks to PostgreSQL through Prisma and to object storage through a small
provider abstraction. There is no separate backend service — API routes under
`src/app/api/**` are the backend.

```
Browser ──▶ Next.js (RSC + Route Handlers) ──▶ Prisma ──▶ PostgreSQL
                     │                    └──▶ Storage provider (local | S3)
                     └──▶ DataProvider abstraction ──▶ (external science APIs | demo generator)
```

## Directory map

```
src/
├── app/                     # routes (pages + /api route handlers)
│   ├── (auth)/              # login / register / password reset (shared layout)
│   ├── admin/               # admin dashboard, guarded by layout + middleware
│   ├── api/                 # REST API (see docs/api.md)
│   └── <module>/            # explore, repository, data, map, media, education, …
├── components/
│   ├── ui/                  # design-system primitives (button, card, dialog, …)
│   ├── content/             # cards, filter bar, citation box, bookmark button
│   ├── charts/  maps/  education/  admin/  media/  navigation/
├── lib/
│   ├── env.ts               # Zod-validated environment access (fail-fast)
│   ├── db.ts                # Prisma singleton
│   ├── auth/                # password hashing, session helpers
│   ├── rbac.ts              # roles, permissions, assertCan()
│   ├── api.ts               # handle() wrapper, error envelope, rate-limit helper
│   ├── validation/          # shared Zod schemas (client + server)
│   ├── search/              # full-text search abstraction
│   ├── storage/             # StorageProvider: local + s3
│   ├── data-providers/      # DataProvider: SeaIce/Climate/Ocean/Cryosphere + demo
│   ├── services/            # entity CRUD helpers + generic REST factory
│   ├── citations.ts  markdown.ts  analytics.ts  audit.ts  notifications.ts
├── middleware.ts            # coarse route protection
└── auth.ts                  # NextAuth configuration
prisma/
├── schema.prisma            # normalized schema
├── seed.ts  seed-data.ts    # demo content
```

## Rendering strategy

- Marketing / low-churn pages (`/`, `/explore`, `/data`, `/glossary`, `/map`)
  use `revalidate` (ISR).
- Content pages that reflect DB writes immediately use `dynamic = 'force-dynamic'`.
- All server components wrap DB reads in `safe()` so infrastructure failures
  degrade to empty states instead of 500s.
- Leaflet is loaded via `next/dynamic` with `ssr: false`.

## Search abstraction

`src/lib/search/index.ts` exposes `searchRepository()` and `globalSearch()`.
The repository search builds a weighted `tsvector` expression in raw SQL with an
`ILIKE` fallback for very short queries, and orders by `ts_rank` for relevance.
No PostgreSQL extension is required. Optional GIN indexes for scale live in
`prisma/sql/fulltext.sql` (`npm run db:fulltext`).

**To migrate to Elasticsearch / OpenSearch / Meilisearch:** implement the same
two function signatures against the new engine and swap the module — nothing in
the UI or API routes changes.

## Map extension points

`/api/map/layers` returns GeoJSON `FeatureCollection`s keyed by layer plus a flat
list for the accessible table. To add:

- **WMS/WFS or vector tiles** — add a `<TileLayer>` / `<WMSTileLayer>` in
  `PolarMap` and a tile URL env var.
- **Polar-projection basemap** — swap `MapContainer`'s CRS for
  `L.CRS.EPSG3413` (Arctic) / `EPSG:3031` (Antarctic) with `proj4leaflet`.
- **More overlays** — add a `Location.kind` and a branch in the layers route.

## Internationalisation

English is the only bundled locale. The architecture keeps it addable:

- User-facing strings live in components today; the migration path is to move
  them into `messages/<locale>.json` and wrap the tree in a provider
  (`next-intl` recommended).
- `LanguageSelector` already persists a choice to `localStorage` + a `psp.locale`
  cookie, so a future `middleware` can negotiate locale from the cookie /
  `Accept-Language`.
- Supported locales are declared in `src/lib/constants.ts` (`SUPPORTED_LOCALES`):
  English, Hindi, Dutch, French, Norwegian, Russian, Spanish.

## Analytics & privacy

`src/lib/analytics.ts` records anonymous events (`page_view`, `search`,
`resource_view`, `download`, `media_view`, `event_registration`) — no IP, no user
id. The client beacon (`AnalyticsTracker`) is disabled server-side when the
`psp_analytics=0` cookie (set by the consent banner) is present, and globally by
`ANALYTICS_ENABLED=false`.

## Notifications

In-app notifications are written to the `Notification` table. Email dispatch is an
integration point in `src/lib/notifications.ts` (`sendEmail`) — wire up nodemailer
or a provider SDK using `EMAIL_SERVER`. Types: submission approved / rejected,
event reminder, research published, expedition update, system.
