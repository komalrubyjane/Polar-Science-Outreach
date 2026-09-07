/**
 * Minimal structured logger. Emits single-line JSON in production so log
 * aggregators (Loki, CloudWatch, Datadog) can parse it; pretty prints in dev.
 *
 * NEVER pass secrets, passwords, tokens or raw PII into the context object.
 */

type Level = 'debug' | 'info' | 'warn' | 'error';

const LEVEL_ORDER: Record<Level, number> = { debug: 10, info: 20, warn: 30, error: 40 };

const MIN_LEVEL: Level =
  (process.env.LOG_LEVEL as Level) ??
  (process.env.NODE_ENV === 'production' ? 'info' : 'debug');

const REDACT_KEYS = new Set([
  'password',
  'passwordhash',
  'token',
  'accesstoken',
  'refreshtoken',
  'authorization',
  'cookie',
  'secret',
  'apikey',
]);

function redact(context: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(context)) {
    out[k] = REDACT_KEYS.has(k.toLowerCase()) ? '[redacted]' : v;
  }
  return out;
}

function emit(level: Level, message: string, context: Record<string, unknown> = {}) {
  if (LEVEL_ORDER[level] < LEVEL_ORDER[MIN_LEVEL]) return;
  const entry = {
    ts: new Date().toISOString(),
    level,
    message,
    ...redact(context),
  };
  const line = JSON.stringify(entry);
  if (level === 'error') console.error(line);
  else if (level === 'warn') console.warn(line);
  else console.log(line);
}

export const logger = {
  debug: (msg: string, ctx?: Record<string, unknown>) => emit('debug', msg, ctx),
  info: (msg: string, ctx?: Record<string, unknown>) => emit('info', msg, ctx),
  warn: (msg: string, ctx?: Record<string, unknown>) => emit('warn', msg, ctx),
  error: (msg: string, ctx?: Record<string, unknown>) => emit('error', msg, ctx),
};
