import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { env } from '@/lib/env';

/**
 * Edge middleware: coarse route protection + security headers.
 * Fine-grained permission checks happen in each route/page with `requirePermission`.
 */

const PROTECTED_PREFIXES = ['/profile', '/bookmarks', '/submit'];
const STAFF_PREFIXES = ['/admin'];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const needsAuth = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  const needsStaff = STAFF_PREFIXES.some((p) => pathname.startsWith(p));

  if (needsAuth || needsStaff) {
    const token = await getToken({ req, secret: env.AUTH_SECRET });
    if (!token) {
      const url = req.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(url);
    }
    if (needsStaff && !['EDITOR', 'ADMIN'].includes(String(token.role))) {
      const url = req.nextUrl.clone();
      url.pathname = '/403';
      return NextResponse.rewrite(url);
    }
    // Force password change for bootstrap accounts.
    if (token.mustChangePassword && pathname !== '/profile/security') {
      const url = req.nextUrl.clone();
      url.pathname = '/profile/security';
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/profile/:path*', '/bookmarks/:path*', '/submit/:path*', '/admin/:path*'],
};
