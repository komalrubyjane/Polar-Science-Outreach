# Admin guide

Admin area: `/admin` (visible to `EDITOR` and `ADMIN`). Sidebar:
Dashboard · Review queue · Content · Analytics · Users* · Audit log*
(*admin only).

## Dashboard

Live counts (users, research, datasets, media, articles, events, expeditions,
pending submissions, downloads), 12-month user + repository growth, research by
discipline, most-viewed research, and a 30-day analytics strip. All figures are
from this deployment's database — empty until you seed or create content.

## Review queue (`/admin/submissions`)

Researcher submissions arrive here as **Pending**. Expand one to see the proposed
payload and any prior reviewer comment.

- **Approve & publish** — for a `RESEARCH` submission this *creates* the record
  and publishes it; for an edit submission it publishes the linked record. The
  author gets a "submission approved" notification.
- **Request changes** — keeps it open, sends the author your comment.
- **Reject** — closes it, sends the author your comment.

Every decision is written to the audit log.

## Content management (`/admin/content?type=…`)

Tabbed table for research, datasets, media, news, events, expeditions, education,
topics, glossary, researchers, institutions. Per row:

- **View** — opens the public page in a new tab.
- **Publish / Archive** — toggles `status` (types with a workflow only).
- **Delete** — permanent; confirms first.

New research is created through the **submission workflow** (`/submit`). Other
types are created via their API (`docs/api.md`) — e.g. news:

```bash
curl -X POST https://your-domain/api/news \
  -H 'Content-Type: application/json' --cookie "$SESSION" \
  -d '{"title":"…","body":"# Heading\n\nMarkdown body…","category":"RESEARCH","status":"PUBLISHED"}'
```

The news/education/expedition body fields are **Markdown**, rendered through a
safe (HTML-escaping) renderer.

## Users (`/admin/users`, admin only)

Change a role from the dropdown or delete an account. Guards:
you cannot change **your own** role here; at least **one ADMIN** must always
remain. New users created here are flagged `mustChangePassword`.

## Analytics (`/admin/analytics`)

30-day totals by event type, page views per day, top searches, most-viewed
resources. Anonymous only; respects the visitor opt-out cookie and
`ANALYTICS_ENABLED`.

## Audit log (`/admin/audit`, admin only)

Every administrative / workflow action: who, what (`entity.action`), which entity,
when. IPs are stored only as keyed hashes. Paginated, filterable by action and
entity type.

## Common tasks

| Task | Where |
| --- | --- |
| Promote a user to Researcher so they can submit | Users → role dropdown |
| Publish a researcher's submission | Review queue → Approve & publish |
| Take a record offline | Content → Archive |
| Add a glossary term / topic | `POST /api/glossary` / `POST /api/topics` |
| Add an event | `POST /api/events` then it appears under Content → Events |
| See who deleted something | Audit log → filter action `*.delete` |
| Reset demo content | `npm run db:seed` (server shell) |
