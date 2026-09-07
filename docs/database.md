# Database

PostgreSQL 14+ via Prisma. Schema: [`prisma/schema.prisma`](../prisma/schema.prisma).

## Entity groups

| Group | Models |
| --- | --- |
| Auth | `User`, `Account`, `Session`, `VerificationToken`, `PasswordResetToken` |
| Directory | `Institution`, `Researcher` |
| Taxonomy | `Topic` (self-referential tree), `Tag`, `Region`, `Location` |
| Repository | `Research`, `ResearchAuthor`, `ResearchTopic`, `ResearchTag` |
| Datasets | `Dataset`, `DatasetVersion`, `DatasetResearch` |
| Media | `Media`, `MediaCollection`, `MediaCollectionItem`, `MediaTopic`, `MediaTag`, `MediaResearch` |
| Field | `ResearchStation`, `Expedition`, `ExpeditionMember`, `ExpeditionUpdate` |
| Outreach | `Event`, `EventRegistration`, `NewsArticle`, `NewsTag`, `EducationResource`, `Quiz`, `QuizQuestion`, `QuizOption`, `QuizAttempt`, `GlossaryTerm` |
| Activity | `Bookmark`, `Download`, `NewsletterSubscriber` |
| Workflow | `Submission`, `Review` |
| Files | `FileAsset` |
| Ops | `Notification`, `AuditLog`, `AnalyticsEvent` |

## Conventions

- Primary keys: `cuid()`. Timestamps: `createdAt` default `now()`, `updatedAt`
  `@updatedAt`.
- Public content has a `status` (`ContentStatus`) and a URL `slug` (`@unique`).
- Foreign keys use `onDelete: Cascade` for owned children and `SetNull` for
  optional references (so deleting a user doesn't destroy their content history).
- Many-to-many uses explicit join models (e.g. `ResearchAuthor`) so the join can
  carry data (`authorOrder`, `isCorresponding`).
- `Bookmark` and `Download` are polymorphic via `entityType` + `entityId`.
- Enums are used for every controlled vocabulary (`Discipline`, `Pole`,
  `RepositoryType`, `MediaType`, `EventType`, `NewsCategory`, `LicenseType`, …).

## Indexes

Every foreign key, every `status`, and the common filter/sort columns
(`publicationDate`, `startAt`, `viewCount`, `pole`, `discipline`, `type`,
`createdAt`) are indexed. See the `@@index` lines in the schema.

For repository full-text search at scale, add GIN indexes:

```bash
npm run db:fulltext     # runs prisma/sql/fulltext.sql (idempotent)
```

Search works without them (sequential `to_tsvector`), just slower on large tables.

## Migrations

```bash
npm run db:migrate                 # dev: create + apply a migration
npm run db:migrate:deploy          # prod: apply committed migrations
npm run db:push                    # no history — prototyping / first Supabase push
```

Commit the generated `prisma/migrations/**` folder. The Docker entrypoint runs
`prisma migrate deploy` on start (falling back to `db push`).

## Seeding

`npm run db:seed` runs `prisma/seed.ts`. It first deletes previously-seeded demo
rows (only `isDemo: true` content + the demo accounts and their dependent join
rows) and then recreates: 4 accounts, 11 regions, 8 institutions, 12 researchers,
8 stations + map locations, 34 topics, 18 glossary terms, 20 research records,
10 datasets, 30 media assets, 10 news articles, 8 events, 5 expeditions with
journals, 15 education resources, 3 quizzes, and 2 pending submissions.

## Backups

**PostgreSQL** (nightly `cron`):

```bash
pg_dump --format=custom --no-owner "$DATABASE_URL" \
  > "backup-$(date +%F).dump"
# restore:
pg_restore --clean --no-owner --dbname "$DATABASE_URL" backup-YYYY-MM-DD.dump
```

Managed Postgres (Supabase / Neon / RDS) — enable point-in-time recovery and
scheduled snapshots in the provider console; keep at least 7 daily + 4 weekly.

**Media** — if `STORAGE_PROVIDER=s3`, enable bucket versioning + lifecycle rules
and cross-region replication. For `local`, back up `LOCAL_STORAGE_DIR` alongside
the DB dump (they must be restored to the same point in time — `FileAsset` rows
reference storage keys).

**Recovery drill:** restore the latest dump + matching media snapshot into a
staging environment, run `npm run db:migrate:deploy`, and smoke-test
`/`, `/repository`, a detail page and admin login.
