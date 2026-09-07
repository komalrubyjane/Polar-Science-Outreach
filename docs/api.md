# API reference

Base path: `/api`. All responses are JSON.

- Success: `{ "data": ... }` (lists: `{ "data": [...], "meta": { total, page, pageSize, pageCount } }`)
- Error: `{ "error": { "message": string, ...extra } }` with an appropriate status.
- Validation errors: `422` with `error.issues: [{ path, message }]`.
- Auth: session cookie (Auth.js). Missing → `401`; insufficient role → `403`.
- Rate limiting: write/auth/search endpoints are limited per IP; `429` with
  `error.retryAfterSeconds`.

## Auth

| Method | Path | Body | Notes |
| --- | --- | --- | --- |
| `POST` | `/api/auth/register` | `{ name, email, password }` | Public. Does not reveal existing emails. |
| `POST` | `/api/auth/password-reset` | `{ email }` | Always `200`. Emails a token if the account exists. |
| `PUT` | `/api/auth/password-reset` | `{ token, password }` | Completes the reset. |
| `*` | `/api/auth/[...nextauth]` | — | Auth.js sign-in / callback / session. |

## Repository — research

| Method | Path | Role | Notes |
| --- | --- | --- | --- |
| `GET` | `/api/research` | public | Query: `q, pole, discipline, type, institutionId, language, license, yearFrom, yearTo, sort` (`relevance\|newest\|oldest\|most_viewed`), `page, pageSize`. `all=true` (editor+) includes unpublished. |
| `POST` | `/api/research` | researcher+ | Creates a record; non-editors are forced to `SUBMITTED`. |
| `GET` | `/api/research/:idOrSlug` | public | Unpublished visible only to owner / editor+. |
| `PUT` | `/api/research/:id` | owner or editor+ | Only editor+ may set `APPROVED\|PUBLISHED\|ARCHIVED`. |
| `DELETE` | `/api/research/:id` | owner or editor+ | |

## Simple content collections

`datasets`, `media`, `events`, `news`, `education`, `expeditions`, `topics`,
`glossary`, `researchers`, `institutions` — each exposes:

| Method | Path | Role |
| --- | --- | --- |
| `GET` | `/api/<type>` | public (published only unless `all=true` + editor) |
| `POST` | `/api/<type>` | the type's manage permission (editor+ for most) |
| `GET` | `/api/<type>/:idOrSlug` | public |
| `PUT` | `/api/<type>/:id` | manage permission |
| `DELETE` | `/api/<type>/:id` | manage permission |

List query params: `q`, `page`, `pageSize`, plus type-specific equality filters
(e.g. media: `type`, `regionId`; events: `type`, `mode`; news: `category`).

### Extra endpoints

| Method | Path | Role | Purpose |
| --- | --- | --- | --- |
| `POST` `DELETE` | `/api/events/:id/register` | user+ | Register / cancel; capacity + waitlist aware. |
| `GET` `POST` | `/api/expeditions/:id/updates` | researcher+ (POST) | Journal entries. |
| `POST` | `/api/quizzes/:idOrSlug/attempt` | public | `{ answers: [{questionId, optionId}] }` → score + per-question review. |

## Datasets & data series

| Method | Path | Notes |
| --- | --- | --- |
| `GET` | `/api/data/series` | Lists provider series + whether an external source is configured. |
| `GET` | `/api/data/series/:id` | Normalised series. `?format=csv` or `?format=json-file` to download. |
| `GET` | `/api/datasets/:idOrSlug` | DB dataset with versions + linked research. |

## Search

| Method | Path | Notes |
| --- | --- | --- |
| `GET` | `/api/search?q=` | Global search grouped by type: research, datasets, media, news, events, education, researchers, institutions, glossary. |

## Map

| Method | Path | Notes |
| --- | --- | --- |
| `GET` | `/api/map/layers?pole=ARCTIC\|ANTARCTIC` | GeoJSON `FeatureCollection`s per layer + a flat accessible list. |

## User activity

| Method | Path | Role |
| --- | --- | --- |
| `GET` `POST` `DELETE` | `/api/bookmarks` | user+ |
| `GET` `PUT` | `/api/profile` | user+ |
| `PUT` | `/api/profile/password` | user+ |
| `GET` `POST` | `/api/notifications` | user+ (`POST` marks read) |
| `POST` `GET` | `/api/newsletter` | public (`GET ?unsubscribe=token`) |
| `GET` | `/api/newsletter/confirm?token=` | public (double opt-in) |

## Files

| Method | Path | Role |
| --- | --- | --- |
| `POST` | `/api/files` | researcher+ | multipart `file`, `purpose`, `public`. Validates MIME + extension + size. |
| `GET` | `/api/files/<key>` | public for public assets; auth for private | Streams the object; records a `Download`. |

## Workflow & admin

| Method | Path | Role |
| --- | --- | --- |
| `GET` `POST` | `/api/submissions` | researcher+ (own) / editor+ (all) |
| `POST` | `/api/submissions/:id/review` | editor+ | `{ decision: APPROVED\|REJECTED\|CHANGES_REQUESTED, comment }` |
| `GET` | `/api/analytics` | editor+ | 30-day summary (`?days=`) |
| `POST` | `/api/analytics` | public beacon | Honours the `psp_analytics=0` opt-out cookie. |
| `GET` | `/api/admin/stats` | editor+ | Dashboard figures. |
| `GET` `POST` | `/api/admin/users` | admin | List / create users. |
| `PATCH` `DELETE` | `/api/admin/users/:id` | admin | Change role / delete (keeps ≥1 admin). |
| `GET` | `/api/admin/audit` | admin | Audit log (`?action=`, `?entityType=`, `?page=`). |
