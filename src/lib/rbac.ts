import type { Role } from '@prisma/client';

/**
 * Role-based access control.
 *
 * Roles are ordered by privilege. `VISITOR` is a pseudo-role for unauthenticated
 * requests and is never stored in the database.
 */

export type AppRole = Role | 'VISITOR';

const RANK: Record<AppRole, number> = {
  VISITOR: 0,
  USER: 1,
  RESEARCHER: 2,
  EDITOR: 3,
  ADMIN: 4,
};

export function roleAtLeast(role: AppRole | undefined | null, min: AppRole): boolean {
  return RANK[role ?? 'VISITOR'] >= RANK[min];
}

export type Permission =
  | 'content:submit'
  | 'content:review'
  | 'content:publish'
  | 'research:manage'
  | 'dataset:manage'
  | 'media:manage'
  | 'news:manage'
  | 'event:manage'
  | 'expedition:manage'
  | 'expedition:update'
  | 'education:manage'
  | 'taxonomy:manage'
  | 'directory:manage'
  | 'user:manage'
  | 'audit:read'
  | 'analytics:read'
  | 'admin:access'
  | 'profile:self'
  | 'bookmark:self';

const MIN_ROLE_FOR: Record<Permission, AppRole> = {
  'profile:self': 'USER',
  'bookmark:self': 'USER',
  'content:submit': 'RESEARCHER',
  'research:manage': 'RESEARCHER', // own submissions; editors/admins get all
  'dataset:manage': 'RESEARCHER',
  'expedition:update': 'RESEARCHER',
  'content:review': 'EDITOR',
  'content:publish': 'EDITOR',
  'media:manage': 'EDITOR',
  'news:manage': 'EDITOR',
  'event:manage': 'EDITOR',
  'expedition:manage': 'EDITOR',
  'education:manage': 'EDITOR',
  'taxonomy:manage': 'EDITOR',
  'directory:manage': 'EDITOR',
  'analytics:read': 'EDITOR',
  'admin:access': 'EDITOR',
  'user:manage': 'ADMIN',
  'audit:read': 'ADMIN',
};

export function can(role: AppRole | undefined | null, permission: Permission): boolean {
  return roleAtLeast(role, MIN_ROLE_FOR[permission]);
}

/** Throws if the role lacks the permission. Use in API routes / server actions. */
export function assertCan(role: AppRole | undefined | null, permission: Permission): void {
  if (!can(role, permission)) {
    throw new AuthorizationError(permission);
  }
}

export class AuthorizationError extends Error {
  readonly status = 403;
  constructor(permission: string) {
    super(`Forbidden: missing permission "${permission}"`);
    this.name = 'AuthorizationError';
  }
}

export class AuthenticationError extends Error {
  readonly status = 401;
  constructor(message = 'Authentication required') {
    super(message);
    this.name = 'AuthenticationError';
  }
}
