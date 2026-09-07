# Integrated Polar Science Outreach, Knowledge Repository & Media Dissemination Portal

A production-ready web application for **polar science, Arctic & Antarctic research,
environmental monitoring, education, public outreach, knowledge preservation and
multimedia dissemination**.

It is a **dissemination platform** — it aggregates and presents research, data and
media from many producers, with strong provenance on every record. Demonstration
content (some institutions, researcher profiles and datasets) is fictional and
clearly labelled.

---

## Stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 15 (App Router) · React 19 · TypeScript (strict) |
| Styling | Tailwind CSS · Radix UI primitives · Lucide icons |
| Data viz | Recharts |
| Maps | Leaflet + React-Leaflet (OpenStreetMap tiles; pluggable) |
| Database | PostgreSQL + Prisma ORM |
| Auth | Auth.js (NextAuth v5) — credentials + optional Google OAuth, JWT sessions |
| Validation | Zod (shared client + server schemas) |
| Storage | Abstraction with **local filesystem** (dev) and **S3-compatible** (prod: AWS S3 / Cloudflare R2 / MinIO) providers |
| Search | PostgreSQL full-text (`to_tsvector` / `ts_rank`) behind a swappable interface |
| Tests | Vitest (unit) · Playwright (E2E) |
| Deploy | Docker + Docker Compose · Vercel-compatible · standalone output |

---

## Quick start (local, with Docker for Postgres)

```bash
git clone <this repo>
cd polar-science-portal
cp .env.example .env            # then edit DATABASE_URL / AUTH_SECRET

npm install
docker compose up -d db         # starts PostgreSQL on :5432
npm run db:migrate              # create schema (first run creates the migration)
npm run db:seed                 # load demo content
npm run dev                     # http://localhost:3000
```

Generate an auth secret with `openssl rand -base64 32`.

### Without Docker

Point `DATABASE_URL` at any PostgreSQL 14+ instance (local, Supabase, Neon, RDS …),
then run the same `db:migrate` / `db:seed` / `dev` commands.

> **Supabase note:** use the **pooler** connection strings (Project Settings →
> Database → Connection string), not the "Direct connection" host, which is
> IPv6-only. Set `DATABASE_URL` to the *Transaction pooler* (`:6543`, append
> `?pgbouncer=true`) and `DIRECT_URL` to the *Session pooler* (`:5432`).

### Seed accounts

| Role | Email (default) | Password |
| --- | --- | --- |
| Admin | `admin@example.com` | `ChangeThisPassword123!` |
| Editor | `editor@example.com` | `ChangeThisPassword123!` |
| Researcher | `researcher@example.com` | `ChangeThisPassword123!` |
| User | `user@example.com` | `ChangeThisPassword123!` |

Override via `ADMIN_EMAIL`, `ADMIN_PASSWORD`, … in `.env`. The admin account is
flagged `mustChangePassword` and is forced through `/profile/security` on first
sign-in.

---

## Commands

```bash
npm run dev              # dev server
npm run build            # prisma generate + next build (standalone)
npm run start            # run the production build
npm run lint             # eslint
npm run typecheck        # tsc --noEmit
npm run test             # vitest (unit)
npm run test:e2e         # playwright (needs a running, seeded app)
npm run db:migrate       # prisma migrate dev
npm run db:migrate:deploy# prisma migrate deploy (production)
npm run db:push          # prisma db push (no migration history)
npm run db:seed          # load demo content (clears prior demo rows)
npm run db:studio        # Prisma Studio
npm run db:reset         # drop + re-migrate + re-seed
```

---

## Docker

```bash
# Build image + start app + Postgres, seeding on first boot:
AUTH_SECRET=$(openssl rand -base64 32) SEED_ON_START=true docker compose up --build
# → app on http://localhost:3000, Postgres on :5432
```

The container entrypoint runs `prisma migrate deploy` (falling back to `db push`)
before starting the server; set `SEED_ON_START=true` for the first run only.

---

## Modules

- **Home** — hero, polar regions, live snapshot (DB counts + labelled demo metrics), featured research, discoveries, media, events, education, newsletter.
- **Explore** (`/explore`) — seven thematic areas → topic pages with overview, key concepts, linked research / media / education / glossary.
- **Knowledge Repository** (`/repository`) — full-text search, filters (region, discipline, type, licence, year), sorting, pagination; detail page with abstract, authors, provenance, downloads and **APA / MLA / Chicago / BibTeX** citations.
- **Polar Data** (`/data`) — time-series dashboard via a `DataProvider` abstraction (`SeaIceProvider`, `ClimateProvider`, `OceanProvider`, `CryosphereProvider`). Serves clearly-labelled demo series when no external API is configured; CSV / JSON download; accessible chart summaries + data tables.
- **Polar Map** (`/map`) — Leaflet map of stations, expeditions, observation sites, projects and protected areas; layer toggles; Arctic/Antarctic views; **accessible location list** alternative; GeoJSON layer API at `/api/map/layers`.
- **Media Library** (`/media`) — photo / video / audio / infographic assets with creator, copyright, licence, attribution; viewer with captions & transcripts; masonry gallery + filters.
- **Education & Outreach** (`/education`) — explainers, lesson plans (objectives / materials / assessment), interactive activities (sea-ice simulator, albedo, food web), and quizzes (scored, no account required).
- **Expeditions** (`/expeditions`) — objectives, team, route, research topics, and a **day-by-day journal timeline**; researcher/editor-published live updates.
- **Events** (`/events`) — calendar-style browse; registration flow with capacity / waitlist handling.
- **News** (`/news`) — categories, Markdown body, references, related articles.
- **Directories** — `/researchers`, `/institutions`, `/glossary` (alphabetical + search).
- **Accounts** — register, login, password reset, profile, bookmarks (`/bookmarks`), downloads history, event registrations.
- **Contribute** (`/submit`) — researchers submit research; content enters the review workflow.
- **Admin** (`/admin`) — dashboard (counts + growth + discipline charts), review queue, content management (publish / archive / delete across all types), user management (RBAC), analytics, audit log.

---

## Content workflow

```
Draft → Submitted → Under review → Approved → Published → Archived
                              ↘ Rejected / Changes requested
```

Researchers submit; editors review (with comments; author notified); editors/admins
publish or archive. Every transition is written to the **audit log**.

## Roles (RBAC)

`VISITOR` (unauthenticated) · `USER` · `RESEARCHER` · `EDITOR` · `ADMIN` — see
[`src/lib/rbac.ts`](src/lib/rbac.ts) for the permission matrix. Coarse route
protection is in [`src/middleware.ts`](src/middleware.ts); every API route and
server action re-checks with `requirePermission()`.

---

## Provenance & demo data

- Every data visualisation shows **source, unit, time period, publisher, licence,
  last-updated and methodology**.
- When no external scientific API is configured, the dashboard serves
  **generated demo series** flagged `isDemo: true` with a visible "Demo dataset"
  badge. These are **not measurements** and must not be cited.
- If a configured external source fails, the app shows the **latest cached data**
  with its date and a non-intrusive warning — it never fabricates replacements.
- Demonstration institutions, researcher profiles and datasets are **fictional**
  and flagged `isDemo`. No invented findings are attributed to real people.

---

## Documentation

| Doc | Contents |
| --- | --- |
| [`docs/architecture.md`](docs/architecture.md) | High-level architecture, i18n, search & map extension points |
| [`docs/database.md`](docs/database.md) | Schema overview, entities, indexes, migrations, backups |
| [`docs/api.md`](docs/api.md) | REST API reference |
| [`docs/authentication.md`](docs/authentication.md) | Auth model, sessions, OAuth, password reset |
| [`docs/storage.md`](docs/storage.md) | Storage abstraction, upload validation, virus-scan hook |
| [`docs/scientific-data.md`](docs/scientific-data.md) | DataProvider abstraction & adding real sources |
| [`docs/deployment.md`](docs/deployment.md) | Vercel and Docker/VPS deployment, HTTPS, backups, monitoring |
| [`docs/admin-guide.md`](docs/admin-guide.md) | Day-to-day admin tasks |
| [`docs/contributing.md`](docs/contributing.md) | Dev workflow, conventions, testing |

---

## Security

Input validated with Zod on the server (never trusting the client); RBAC on every
mutating endpoint; per-IP rate limiting on auth / write / search endpoints; secure
headers (`next.config.mjs`); parameterised queries via Prisma; HTML-escaping
Markdown renderer (no `dangerouslySetInnerHTML` of raw user input); private files
proxied through an authorization check; upload MIME + extension + size validation
with a virus-scan integration point; audit logging; structured logs that redact
secrets and PII.

## Licence

Application code: MIT (see `LICENSE`). Individual research records, datasets and
media assets carry their **own** licences shown on each page.
