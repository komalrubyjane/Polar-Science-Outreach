import { auth } from '@/auth';
import { prisma } from '@/lib/db';
import { AuthenticationError, assertCan, type Permission } from '@/lib/rbac';
import type { Role } from '@prisma/client';

export interface SessionUser {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: Role;
  mustChangePassword: boolean;
}

/** Returns the signed-in user (from the session token) or null. */
export async function getCurrentUser(): Promise<SessionUser | null> {
  const session = await auth();
  if (!session?.user?.id) return null;
  return {
    id: session.user.id,
    name: session.user.name ?? null,
    email: session.user.email ?? '',
    image: session.user.image ?? null,
    role: session.user.role,
    mustChangePassword: session.user.mustChangePassword,
  };
}

/** Like getCurrentUser but throws 401 when unauthenticated. */
export async function requireUser(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) throw new AuthenticationError();
  return user;
}

/** Require the user to hold a given permission; throws 401/403 otherwise. */
export async function requirePermission(permission: Permission): Promise<SessionUser> {
  const user = await requireUser();
  assertCan(user.role, permission);
  return user;
}

/** Fetch the full DB user record for the current session (fresh data). */
export async function getCurrentDbUser() {
  const session = await auth();
  if (!session?.user?.id) return null;
  return prisma.user.findUnique({ where: { id: session.user.id } });
}
