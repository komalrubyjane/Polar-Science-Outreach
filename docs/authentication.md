# Authentication & authorization

## Provider: Auth.js (NextAuth v5)

Config: [`src/auth.ts`](../src/auth.ts). Session strategy: **JWT** (required for the
Credentials provider). Session lifetime: 30 days.

### Providers

1. **Credentials** — email + password. Passwords are hashed with `bcryptjs`
   (12 rounds). `authorize()` returns `null` on any failure and logs a warning
   (no user enumeration).
2. **Google OAuth** — enabled only when both `GOOGLE_CLIENT_ID` and
   `GOOGLE_CLIENT_SECRET` are set (`googleOAuthEnabled` in `src/lib/env.ts`).
   `allowDangerousEmailAccountLinking` is on so an existing email links.

### Token / session shape

The JWT carries `id`, `role`, `mustChangePassword`. `session.user` exposes the
same. A client `update()` re-reads role + flags from the DB (used after an admin
changes a role or a user completes a forced password change).

## Password reset

`POST /api/auth/password-reset` → creates a `PasswordResetToken` (1 h expiry),
emails a link. Always returns `200`. `PUT` with `{ token, password }` verifies and
rotates the hash, clears `mustChangePassword`, and deletes all tokens for that
email in a transaction.

## Email verification

`User.emailVerified` and the `VerificationToken` table exist for the Auth.js
email flow. Seed accounts are pre-verified. Wire `sendEmail` (see
`docs/storage.md` sibling note in `src/lib/notifications.ts`) to enable
verification mails in production.

## Forced password change

Seed admin has `mustChangePassword = true`. `src/middleware.ts` redirects such
users to `/profile/security` until they change it.

## Authorization (RBAC)

`src/lib/rbac.ts`:

```
VISITOR(0) < USER(1) < RESEARCHER(2) < EDITOR(3) < ADMIN(4)
```

`can(role, permission)` checks the minimum role for a permission;
`assertCan()` throws `AuthorizationError` (→ 403). Server helpers
`requireUser()` / `requirePermission()` (`src/lib/auth/session.ts`) are used at
the top of every mutating route handler and protected page.

`src/middleware.ts` adds a coarse gate: `/profile`, `/bookmarks`, `/submit`
require a token; `/admin` requires `EDITOR`/`ADMIN`. **Middleware is not the
security boundary** — every route re-checks.

## Rate limiting

`src/lib/rate-limit.ts` — in-memory fixed-window limiter keyed by IP + scope.
Applied to register, login attempts (via failed-auth logging), password reset,
newsletter, uploads, search, quiz attempts and content creation. Swap the store
for Redis for multi-instance deployments; the `rateLimit()` signature stays.

## Secrets

`AUTH_SECRET` must be a long random value (`openssl rand -base64 32`). Never
commit `.env`. In production set it via the platform's secret manager.
