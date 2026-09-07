// Minimal environment for unit tests. No real services are contacted.
process.env.NODE_ENV = process.env.NODE_ENV || 'test';
process.env.DATABASE_URL =
  process.env.DATABASE_URL || 'postgresql://test:test@localhost:5432/test?schema=public';
process.env.AUTH_SECRET = process.env.AUTH_SECRET || 'test-secret-value-000000000000000000000000';
process.env.NEXT_PUBLIC_APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
process.env.STORAGE_PROVIDER = 'local';
