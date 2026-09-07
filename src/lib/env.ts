import { z } from 'zod';

/**
 * Centralised, validated environment access.
 * Import `env` anywhere instead of reading `process.env` directly.
 */

const bool = (def: boolean) =>
  z
    .string()
    .optional()
    .transform((v) => (v == null || v === '' ? def : v === 'true' || v === '1'));

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),

  /**
   * Real value MUST be provided in any environment that needs data (set it in
   * the host's env-var UI). We fall back to an unroutable placeholder so a
   * deploy still builds and boots — every DB call is wrapped in `safe()`, so
   * pages then render with empty / demonstration states instead of 500s.
   */
  DATABASE_URL: z
    .string()
    .min(1)
    .default('postgresql://placeholder:placeholder@127.0.0.1:5432/placeholder'),
  DIRECT_URL: z.string().optional().default(''),

  AUTH_SECRET: z
    .string()
    .min(1, 'AUTH_SECRET is required')
    .default('dev-only-insecure-secret-change-me-please-0000000000'),
  AUTH_TRUST_HOST: bool(true),

  GOOGLE_CLIENT_ID: z.string().optional().default(''),
  GOOGLE_CLIENT_SECRET: z.string().optional().default(''),

  ADMIN_EMAIL: z.string().email().default('admin@example.com'),
  ADMIN_PASSWORD: z.string().min(8).default('ChangeThisPassword123!'),
  EDITOR_EMAIL: z.string().email().default('editor@example.com'),
  EDITOR_PASSWORD: z.string().min(8).default('ChangeThisPassword123!'),
  RESEARCHER_EMAIL: z.string().email().default('researcher@example.com'),
  RESEARCHER_PASSWORD: z.string().min(8).default('ChangeThisPassword123!'),
  USER_EMAIL: z.string().email().default('user@example.com'),
  USER_PASSWORD: z.string().min(8).default('ChangeThisPassword123!'),

  STORAGE_PROVIDER: z.enum(['local', 's3']).default('local'),
  LOCAL_STORAGE_DIR: z.string().default('./storage'),
  S3_ENDPOINT: z.string().optional().default(''),
  S3_REGION: z.string().optional().default('auto'),
  S3_BUCKET: z.string().optional().default(''),
  S3_ACCESS_KEY: z.string().optional().default(''),
  S3_SECRET_KEY: z.string().optional().default(''),
  S3_FORCE_PATH_STYLE: bool(true),
  S3_PUBLIC_URL: z.string().optional().default(''),

  NEXT_PUBLIC_MAP_API_KEY: z.string().optional().default(''),
  NEXT_PUBLIC_MAP_TILE_URL: z.string().optional().default(''),

  EMAIL_SERVER: z.string().optional().default(''),
  EMAIL_FROM: z.string().optional().default('Polar Science Portal <no-reply@example.com>'),

  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(60),
  RATE_LIMIT_WINDOW_SECONDS: z.coerce.number().int().positive().default(60),

  ANALYTICS_ENABLED: bool(true),

  /**
   * When true, pages fall back to bundled demonstration content wherever the
   * database or an external scientific source has no data. PRODUCTION DEFAULT
   * IS FALSE — real data only, with honest "unavailable" states otherwise.
   */
  DEMO_MODE: bool(false),

  // Sea ice: default is the public NSIDC Sea Ice Index daily-extent CSV (no key).
  NSIDC_SEA_ICE_API_URL: z
    .string()
    .optional()
    .default('https://noaadata.apps.nsidc.org/NOAA/G02135'),
  CLIMATE_DATA_API_URL: z.string().optional().default(''),
  OCEAN_DATA_API_URL: z.string().optional().default(''),
  NASA_EARTHDATA_API_URL: z.string().optional().default(''),
  NASA_EARTHDATA_TOKEN: z.string().optional().default(''),
  NOAA_API_URL: z.string().optional().default(''),
  NOAA_API_TOKEN: z.string().optional().default(''),
  USAP_API_URL: z.string().optional().default('https://www.usap-dc.org/view/dataset'),

  // Optional editorial-imagery search (server-side only). Curated imagery works
  // without this; it only powers image browsing for editors.
  UNSPLASH_ACCESS_KEY: z.string().optional().default(''),
  PEXELS_API_KEY: z.string().optional().default(''),
});

/**
 * Treat empty-string env vars as "unset" so the schema defaults below apply.
 * Hosting dashboards (Vercel etc.) frequently materialise declared-but-blank
 * variables as `''`, which would otherwise fail `.url()` / `.email()` / enum
 * checks instead of falling back to the default.
 */
const rawEnv: Record<string, string | undefined> = {};
for (const [key, value] of Object.entries(process.env)) {
  rawEnv[key] = value === '' ? undefined : value;
}

// On Vercel, fall back to the deployment URL when no explicit app URL is given.
if (!rawEnv.NEXT_PUBLIC_APP_URL && process.env.VERCEL_URL) {
  rawEnv.NEXT_PUBLIC_APP_URL = `https://${process.env.VERCEL_URL}`;
}

const parsed = schema.safeParse(rawEnv);

if (!parsed.success) {
  const issues = parsed.error.issues
    .map((i) => `  - ${i.path.join('.')}: ${i.message}`)
    .join('\n');
  // Fail fast — a misconfigured server should not boot.
  throw new Error(`Invalid environment configuration:\n${issues}`);
}

export const env = parsed.data;

/** True when no real database URL was supplied (running on the placeholder). */
export const databaseConfigured = !env.DATABASE_URL.includes('placeholder:placeholder@127.0.0.1');

if (!databaseConfigured) {
  console.warn(
    '[env] DATABASE_URL is not set — using an unroutable placeholder. ' +
      'The app will build and boot, but every database query will fail and ' +
      'pages will render empty / demonstration states. Set DATABASE_URL in ' +
      "the host's environment variables for real data.",
  );
}
if (
  env.NODE_ENV === 'production' &&
  env.AUTH_SECRET === 'dev-only-insecure-secret-change-me-please-0000000000'
) {
  console.warn('[env] AUTH_SECRET is the insecure default — set a real secret in production.');
}

export const isProd = env.NODE_ENV === 'production';
export const isTest = env.NODE_ENV === 'test';
export const googleOAuthEnabled = Boolean(
  env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET,
);
export const emailEnabled = Boolean(env.EMAIL_SERVER);
