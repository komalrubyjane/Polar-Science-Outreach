import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'node',
    include: ['tests/unit/**/*.test.{ts,tsx}'],
    globals: true,
    setupFiles: ['tests/setup.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      // `server-only` ships a client-error stub under test resolution conditions.
      'server-only': path.resolve(__dirname, './tests/stubs/empty.ts'),
    },
  },
});
