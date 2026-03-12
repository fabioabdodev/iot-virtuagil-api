import { envSchema } from './env.schema';

describe('envSchema', () => {
  it('applies defaults and coerces numeric values', () => {
    const result = envSchema.parse({
      DATABASE_URL: 'postgresql://user:pass@localhost:5432/app',
      PORT: '4000',
      DEVICE_OFFLINE_MINUTES: '10',
      ALERT_QUEUE_RETRY_DELAY_MS: '1500',
    });

    expect(result).toEqual(
      expect.objectContaining({
        NODE_ENV: 'development',
        PORT: 4000,
        DATABASE_URL: 'postgresql://user:pass@localhost:5432/app',
        DEVICE_OFFLINE_MINUTES: 10,
        MONITOR_INTERVAL_SECONDS: 60,
        ALERT_QUEUE_RETRY_DELAY_MS: 1500,
        LOG_LEVEL: 'info',
      }),
    );
  });

  it('rejects invalid URLs and enum values', () => {
    const result = envSchema.safeParse({
      DATABASE_URL: 'postgresql://user:pass@localhost:5432/app',
      NODE_ENV: 'staging',
      N8N_OFFLINE_WEBHOOK_URL: 'not-a-url',
    });

    expect(result.success).toBe(false);
  });
});
