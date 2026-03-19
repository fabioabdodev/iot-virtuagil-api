import { z } from 'zod';

const optionalUrlEnv = z.preprocess((value) => {
  if (typeof value !== 'string') {
    return value;
  }

  const normalized = value.trim();
  return normalized.length === 0 ? undefined : normalized;
}, z.string().url().optional());

const booleanEnv = z.preprocess((value) => {
  if (typeof value === 'boolean') return value;
  if (typeof value !== 'string') return value;

  const normalized = value.trim().toLowerCase();
  if (['1', 'true', 'yes', 'on'].includes(normalized)) return true;
  if (['0', 'false', 'no', 'off', ''].includes(normalized)) return false;
  return value;
}, z.boolean());

export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(3000),
  CORS_ORIGINS: z.string().optional(),
  APP_RELEASE: z.string().optional(),
  APP_BUILD_TIME: z.string().optional(),

  DATABASE_URL: z.string().min(1, 'DATABASE_URL e obrigatoria'),
  DIRECT_DATABASE_URL: z.string().optional(),
  AUTH_SECRET: z.string().min(16, 'AUTH_SECRET deve ter pelo menos 16 caracteres'),
  AUTH_TOKEN_TTL_HOURS: z.coerce.number().default(168),
  AUTH_LOGIN_RATE_LIMIT_WINDOW_SECONDS: z.coerce.number().default(300),
  AUTH_LOGIN_RATE_LIMIT_MAX_ATTEMPTS: z.coerce.number().default(5),
  AUTH_LOGIN_RATE_LIMIT_MAX_TRACKED_KEYS: z.coerce.number().default(10000),
  AUTH_LOGIN_LOCK_MINUTES: z.coerce.number().default(15),
  AUTH_PASSWORD_RESET_TTL_MINUTES: z.coerce.number().default(60),
  AUTH_PASSWORD_RETURN_LINK_IN_RESPONSE: booleanEnv.default(false),
  WEB_APP_URL: z.string().url().optional(),
  TURNSTILE_SECRET_KEY: z.string().optional(),
  TURNSTILE_VERIFY_URL: z.string().url().default(
    'https://challenges.cloudflare.com/turnstile/v0/siteverify',
  ),
  RESEND_API_KEY: z.string().optional(),
  RESEND_FROM_EMAIL: z.string().optional(),

  DEVICE_API_KEY: z.string().min(1, 'DEVICE_API_KEY e obrigatoria').optional(),

  N8N_OFFLINE_WEBHOOK_URL: optionalUrlEnv,
  N8N_ONLINE_WEBHOOK_URL: optionalUrlEnv,
  N8N_TEMPERATURE_ALERT_WEBHOOK_URL: optionalUrlEnv,

  DEVICE_OFFLINE_MINUTES: z.coerce.number().default(5),
  MONITOR_INTERVAL_SECONDS: z.coerce.number().default(60),
  TEMPERATURE_ALERT_COOLDOWN_MINUTES: z.coerce.number().default(5),
  DEVICE_RATE_LIMIT_WINDOW_SECONDS: z.coerce.number().default(60),
  DEVICE_RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(30),
  DEVICE_RATE_LIMIT_MAX_TRACKED_DEVICES: z.coerce.number().default(10000),
  CONNECTIVITY_FLAP_WINDOW_MINUTES: z.coerce.number().default(30),
  CONNECTIVITY_FLAP_THRESHOLD: z.coerce.number().default(3),
  CONNECTIVITY_INSTABILITY_ALERT_COOLDOWN_MINUTES: z.coerce.number().default(60),
  CACHE_TTL_SECONDS: z.coerce.number().default(15),
  ALERT_QUEUE_BATCH_SIZE: z.coerce.number().default(20),
  ALERT_QUEUE_RETRY_MAX: z.coerce.number().default(3),
  ALERT_QUEUE_RETRY_DELAY_MS: z.coerce.number().default(2000),

  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
});

export type Env = z.infer<typeof envSchema>;
