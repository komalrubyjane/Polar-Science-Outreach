-- Optional performance indexes for repository full-text search.
-- Idempotent: safe to run repeatedly. Search works without these (sequential
-- to_tsvector scan) — they matter once the tables get large.
--
--   psql "$DATABASE_URL" -f prisma/sql/fulltext.sql
-- or
--   npm run db:fulltext

CREATE INDEX IF NOT EXISTS research_fts_idx ON "Research"
USING GIN (
  to_tsvector('english',
    coalesce("title", '') || ' ' ||
    array_to_string("keywords", ' ') || ' ' ||
    coalesce("abstract", '') || ' ' ||
    coalesce("description", '')
  )
);

CREATE INDEX IF NOT EXISTS research_title_trgm_idx ON "Research"
USING GIN ("title" gin_trgm_ops);
-- requires: CREATE EXTENSION IF NOT EXISTS pg_trgm;  (uncomment if permitted)
-- CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS media_fts_idx ON "Media"
USING GIN (
  to_tsvector('english', coalesce("title", '') || ' ' || coalesce("description", ''))
);

CREATE INDEX IF NOT EXISTS news_fts_idx ON "NewsArticle"
USING GIN (
  to_tsvector('english', coalesce("title", '') || ' ' || coalesce("subtitle", '') || ' ' || coalesce("body", ''))
);
