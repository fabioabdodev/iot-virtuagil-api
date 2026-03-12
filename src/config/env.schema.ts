import { z } from 'zod';

export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(3000),
  CORS_ORIGINS: z.string().optional(),

  DATABASE_URL: z.string().min(1, 'DATABASE_URL e obrigatoria'),

  DEVICE_API_KEY: z.string().min(1, 'DEVICE_API_KEY e obrigatoria').optional(),

  N8N_OFFLINE_WEBHOOK_URL: z.string().url().optional(),
  N8N_TEMPERATURE_ALERT_WEBHOOK_URL: z.string().url().optional(),

  DEVICE_OFFLINE_MINUTES: z.coerce.number().default(5),
  MONITOR_INTERVAL_SECONDS: z.coerce.number().default(60),
  TEMPERATURE_ALERT_COOLDOWN_MINUTES: z.coerce.number().default(5),
  DEVICE_RATE_LIMIT_WINDOW_SECONDS: z.coerce.number().default(60),
  DEVICE_RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(30),
  DEVICE_RATE_LIMIT_MAX_TRACKED_DEVICES: z.coerce.number().default(10000),
  CACHE_TTL_SECONDS: z.coerce.number().default(15),
  ALERT_QUEUE_BATCH_SIZE: z.coerce.number().default(20),
  ALERT_QUEUE_RETRY_MAX: z.coerce.number().default(3),
  ALERT_QUEUE_RETRY_DELAY_MS: z.coerce.number().default(2000),

  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
});

export type Env = z.infer<typeof envSchema>;
