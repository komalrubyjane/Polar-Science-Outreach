# Contributing

## Setup

```bash
npm install
cp .env.example .env
docker compose up -d db
npm run db:migrate && npm run db:seed
npm run dev
```

## Workflow

1. Branch from `main`.
2. Keep changes focused. Match the surrounding code's style.
3. Before pushing:
   ```bash
   npm run typecheck
   npm run lint
   npm run test
   npm run build
   ```
4. Open a PR describing the change and how you tested it.

## Conventions

- **TypeScript strict.** Avoid `any`; prefer precise types or `unknown` + a
  guard.
- **Validation.** Every external input goes through a Zod schema in
  `src/lib/validation/`. Server never trusts the client.
- **API routes.** Wrap handlers in `handle()` from `src/lib/api.ts`; return via
  `ok` / `created` / `paginated` / `fail`; guard with `requirePermission()`.
- **DB access.** Only in server components, route handlers and `src/lib/**`.
  Wrap page reads in `safe()`.
- **UI.** Compose from `src/components/ui/**`. Handle loading / empty / error
  states. No colour-only meaning. Alt text on images, captions/transcripts on
  media, textual summaries on charts.
- **Data.** Never present generated values as measurements. Flag demo content
  `isDemo` and render the demo badge.
- **Secrets.** Never commit `.env`. Never log passwords, tokens or PII.

## Tests

- **Unit** (`tests/unit/`, Vitest): validation, citations, RBAC, utils,
  markdown, rate limiting, upload validation. No DB required.
- **E2E** (`tests/e2e/`, Playwright): the visitor acceptance journey. Needs a
  built, seeded, running app:
  ```bash
  npm run build && npm run start &     # terminal 1
  npm run test:e2e                     # terminal 2
  ```
- Add integration tests against a disposable Postgres (`docker compose up db`) as
  the suite grows — the service layer in `src/lib/services/` is the seam.

## Adding a content type

1. Model in `prisma/schema.prisma` (+ `@@index`, status, slug). Migrate.
2. Zod schema in `src/lib/validation/`.
3. Config entry in `src/lib/services/entities.ts` and thin routes under
   `src/app/api/<type>/`.
4. A card in `src/components/content/cards.tsx`, list + detail pages.
5. Seed rows in `prisma/seed.ts`. Sitemap entry in `src/app/sitemap.ts`.
6. Admin: add it to the `TYPES` array in `src/app/admin/content/page.tsx`.
