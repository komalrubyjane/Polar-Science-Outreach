import NextAuth, { type DefaultSession, type NextAuthConfig } from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import type { Role } from '@prisma/client';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { env, googleOAuthEnabled } from '@/lib/env';
import { verifyPassword } from '@/lib/auth/password';
import { logger } from '@/lib/logger';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: Role;
      mustChangePassword: boolean;
    } & DefaultSession['user'];
  }
  interface User {
    role?: Role;
    mustChangePassword?: boolean;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string;
    role?: Role;
    mustChangePassword?: boolean;
  }
}

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const providers: NextAuthConfig['providers'] = [
  Credentials({
    name: 'Email and password',
    credentials: {
      email: { label: 'Email', type: 'email' },
      password: { label: 'Password', type: 'password' },
    },
    async authorize(raw) {
      const parsed = credentialsSchema.safeParse(raw);
      if (!parsed.success) return null;
      const { email, password } = parsed.data;

      const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
      });
      if (!user?.passwordHash) return null;

      const valid = await verifyPassword(password, user.passwordHash);
      if (!valid) {
        logger.warn('Failed login attempt', { email: email.toLowerCase() });
        return null;
      }

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        role: user.role,
        mustChangePassword: user.mustChangePassword,
      };
    },
  }),
];

if (googleOAuthEnabled) {
  providers.push(
    Google({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
  );
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt', maxAge: 30 * 24 * 60 * 60 },
  trustHost: env.AUTH_TRUST_HOST,
  secret: env.AUTH_SECRET,
  pages: {
    signIn: '/login',
    error: '/login',
  },
  providers,
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id as string;
        token.role = (user.role ?? 'USER') as Role;
        token.mustChangePassword = user.mustChangePassword ?? false;
      }
      // Allow a client-side `update()` to refresh role / flags after changes.
      if (trigger === 'update' && token.id) {
        const fresh = await prisma.user.findUnique({
          where: { id: token.id },
          select: { role: true, mustChangePassword: true },
        });
        if (fresh) {
          token.role = fresh.role;
          token.mustChangePassword = fresh.mustChangePassword;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id ?? '';
        session.user.role = (token.role ?? 'USER') as Role;
        session.user.mustChangePassword = token.mustChangePassword ?? false;
      }
      return session;
    },
  },
  events: {
    async signIn({ user }) {
      logger.info('User signed in', { userId: user.id });
    },
  },
});
