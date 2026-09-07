-- Optional performance indexes for repository / media / news search.
-- Idempotent: safe to run repeatedly. Search works without these (the query
-- does a runtime to_tsvector scan with an ILIKE fallback) — they matter once
-- the tables get large.
--
--   npm run db:fulltext
--
-- Note: keywords[] is deliberately NOT part of the FTS expression indexes —
-- array_to_string() is STABLE, not IMMUTABLE, so Postgres rejects it inside an
-- index expression. keywords are still searched at query time.

CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ── Trigram indexes: accelerate the ILIKE '%term%' fallback path ──────────────
CREATE INDEX IF NOT EXISTS research_title_trgm_idx    ON "Research"    USING GIN ("title" gin_trgm_ops);
CREATE INDEX IF NOT EXISTS research_abstract_trgm_idx ON "Research"    USING GIN ("abstract" gin_trgm_ops);
CREATE INDEX IF NOT EXISTS media_title_trgm_idx       ON "Media"       USING GIN ("title" gin_trgm_ops);
CREATE INDEX IF NOT EXISTS media_desc_trgm_idx        ON "Media"       USING GIN ("description" gin_trgm_ops);
CREATE INDEX IF NOT EXISTS news_title_trgm_idx        ON "NewsArticle" USING GIN ("title" gin_trgm_ops);
CREATE INDEX IF NOT EXISTS news_body_trgm_idx         ON "NewsArticle" USING GIN ("body" gin_trgm_ops);

-- ── Full-text GIN indexes (IMMUTABLE expressions only) ───────────────────────
CREATE INDEX IF NOT EXISTS research_fts_idx ON "Research"
USING GIN (
  to_tsvector('english',
    coalesce("title", '') || ' ' ||
    coalesce("abstract", '') || ' ' ||
    coalesce("description", '')
  )
);

CREATE INDEX IF NOT EXISTS media_fts_idx ON "Media"
USING GIN (
  to_tsvector('english', coalesce("title", '') || ' ' || coalesce("description", ''))
);

CREATE INDEX IF NOT EXISTS news_fts_idx ON "NewsArticle"
USING GIN (
  to_tsvector('english',
    coalesce("title", '') || ' ' || coalesce("subtitle", '') || ' ' || coalesce("body", ''))
);
