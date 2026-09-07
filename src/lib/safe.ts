import { logger } from './logger';
import { databaseConfigured } from './env';

/**
 * Run a DB/query function and fall back to a default value if it throws
 * (e.g. the database is unreachable). Keeps public pages rendering with empty
 * states instead of 500ing when infrastructure is degraded.
 */
export async function safe<T>(fn: () => Promise<T>, fallback: T, label = 'query'): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    // When no real DATABASE_URL is set, failures are expected and handled by
    // the demo-content fallback — no need to log every one.
    if (databaseConfigured) {
      logger.error(`safe(${label}) failed`, {
        message: err instanceof Error ? err.message : String(err),
      });
    }
    return fallback;
  }
}
