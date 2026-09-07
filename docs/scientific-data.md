# Scientific data integration

## Principle

The portal **never fabricates scientific measurements**. Real data is the only
source in production. Where a source has no data, the UI shows an honest
"Data temporarily unavailable" state — not invented values.

`DEMO_MODE` (env, **default `false`**) is the single switch:

| `DEMO_MODE` | Behaviour |
| --- | --- |
| `false` (production) | Real data only. Empty DB tables / failed sources → real empty & "unavailable" states. |
| `true` (local / preview) | Bundled demonstration content fills gaps, always flagged **"Demo"**. |

Sea ice is **always real** regardless of `DEMO_MODE` — it reads a public NSIDC
dataset that needs no credentials.

## Real sources

| Domain | Provider | Source | Auth | Default |
| --- | --- | --- | --- | --- |
| Sea ice extent (Arctic + Antarctic) | `SeaIceProvider` | **NSIDC Sea Ice Index v4** daily-extent CSV, aggregated to monthly means | none | live |
| Climate & atmosphere | `ClimateProvider` | `CLIMATE_DATA_API_URL` or NASA Earthdata (`NASA_EARTHDATA_API_URL`) | server-side token | configure |
| Ocean | `OceanProvider` | `OCEAN_DATA_API_URL` or NOAA (`NOAA_API_URL`) | server-side token | configure |
| Ice sheets & glaciers | `CryosphereProvider` | NASA Earthdata | server-side token | configure |
| Research stations / expeditions metadata | DB + `USAP_API_URL` catalogue links | US Antarctic Program | none | links |

All credentials are read **server-side only**. None are prefixed `NEXT_PUBLIC_`.

## NSIDC Sea Ice Index (live, no key)

`src/lib/data-providers/nsidc.ts` fetches
`https://noaadata.apps.nsidc.org/NOAA/G02135/{north|south}/daily/data/{N|S}_seaice_extent_daily_v4.0.csv`,
parses the `Year, Month, Day, Extent, …` columns, drops missing rows, and returns
monthly means for the last ~9 years plus the date of the most recent daily
observation.

- Wrapped in React `cache()` (per-render dedup) and `fetch(... { next: { revalidate: 21600 } })` (6-hour data cache).
- Citation stored: *Fetterer, F., et al. Sea Ice Index, Version 4. NSIDC. https://doi.org/10.7265/N5K072F8*
- Shown via `<DataProvenance>` (source / last updated / licence / methodology / citation / "View source") and `<SourceBadge>` + `<DataFreshness>` ("Live" / "Updated Nh ago").

## Fallback chain

```
real source (cached 6h)
  → cached real data (Next data cache)
  → DEMO_MODE ? demo series (flagged "Demo", `degraded` note)
             : NormalizedSeries with points:[] and an `unavailable` marker
```

`NormalizedSeries.unavailable = { reason, source, attemptedAt }` drives the
"Data temporarily unavailable" panel on `/data/[slug]` and the homepage teaser.

## Adding a real provider

1. Create `class MyProvider extends BaseProvider` with a `sourceKey`
   (`'NASA' | 'NOAA' | 'USAP' | …`), an `endpoint` env var, and `seriesIds`.
2. Endpoint accepts `?series=<id>` and returns JSON matching
   `Partial<NormalizedSeries>` (at minimum `points: {t,value}[]`, plus `unit`,
   `source`, `license`, `lastUpdated`).
3. Register it in `PROVIDERS` in `src/lib/data-providers/index.ts`.
4. Add the env var to `.env.example` + `src/lib/env.ts`.

`/api/data/series` and `/api/data/series/:id` (CSV / JSON export), the `/data`
page and the homepage snapshot pick it up automatically.

## Classification & caching

| Class | Example | Cache |
| --- | --- | --- |
| Near-real-time | NSIDC sea ice | 6 h |
| Historical | ice-core, long records | 24 h+ |
| Static metadata | research records, stations | DB, revalidate on write |

## Images

Editorial imagery uses curated Unsplash photo IDs stored in
`src/lib/images/catalog.ts` (id + photographer + tone) — **no image-API request
at render time**. `src/lib/images/queries.ts` maps each slot to a search term for
the optional `UNSPLASH_ACCESS_KEY`-gated `searchImages()` (editor browsing only,
cached 24 h). `SmartImage` degrades candidate → candidate → gradient; attribution
renders through `<ImageCredit>`.
