import { PrismaClient } from '@prisma/client';
import { databaseConfigured } from '@/lib/env';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    // With no real DATABASE_URL every query fails by design and `safe()`
    // swallows it — don't flood the logs with the expected connection errors.
    log: !databaseConfigured
      ? []
      : process.env.NODE_ENV === 'development'
        ? ['warn', 'error']
        : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
