# Scientific data integration

## Principle

The portal **never fabricates scientific measurements**. When it cannot reach a
real source it shows clearly-labelled demo data or the latest cached data, always
with a visible badge and a "last updated" date.

## DataProvider abstraction

`src/lib/data-providers/`:

```
DataProvider (interface)
  key, label
  list(): { id, name }[]
  get(id): NormalizedSeries | null

BaseProvider (abstract)  ── tries `endpoint`, falls back to the matching demo
  ├── SeaIceProvider       (env NSIDC_SEA_ICE_API_URL)
  ├── ClimateProvider      (env CLIMATE_DATA_API_URL)
  ├── OceanProvider        (env OCEAN_DATA_API_URL)
  └── CryosphereProvider   (demo-only)
```

`NormalizedSeries` is the single shape the UI consumes:

```ts
{ id, name, unit, pole, description, methodology?, source, sourceUrl?, license,
  isDemo, lastUpdated, degraded?: { reason, cachedFrom }, points: { t, value }[] }
```

## Behaviour

- **No endpoint configured** → `get()` returns the demo series (`isDemo: true`).
- **Endpoint configured, fetch OK** → upstream payload is merged over the demo
  shape with `isDemo: false`. `fetch` uses `next: { revalidate: 3600 }`.
- **Endpoint configured, fetch fails / empty** → returns the demo series with a
  `degraded` note; the UI shows an amber "live data unavailable" banner and the
  cached date. No values are invented.

## Adding a real provider

1. Create `class MyProvider extends BaseProvider` with a `key`, `label`,
   `endpoint` (an env var) and `demoIds` (fallback series that already exist in
   `demo.ts`, or add new ones).
2. Your endpoint should accept `?series=<id>` and return JSON matching
   `Partial<NormalizedSeries>` — at minimum `points: {t,value}[]`, plus `source`,
   `unit`, `license`, `lastUpdated`.
3. Register it in the `PROVIDERS` array in `src/lib/data-providers/index.ts`.
4. Add the env var to `.env.example` and `src/lib/env.ts`.

`/api/data/series` and `/api/data/series/:id` (with CSV/JSON export) pick it up
automatically; so does the homepage snapshot and `/data`.

## DB-backed datasets

`Dataset` + `DatasetVersion` store curated series inline (`series` JSON) or link a
`FileAsset`. `/data/:slug` and `/api/data/series/:slug` resolve a provider series
first, then fall back to a published `Dataset` with the same slug.

## Demo generator

`src/lib/data-providers/demo.ts` uses a seeded PRNG to build monthly series
(seasonal sinusoid + trend + bounded noise). Every series it produces has
`isDemo: true`, a `source` of `"Demo dataset (generated)"` and a `methodology`
string stating it is synthetic. **Do not cite demo data.**
