import { envSchema } from './env.schema';

describe('envSchema', () => {
  it('applies defaults and coerces numeric values', () => {
    const result = envSchema.parse({
      DATABASE_URL: 'postgresql://user:pass@localhost:5432/app',
      AUTH_SECRET: 'super-secret-key',
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
        CONNECTIVITY_FLAP_WINDOW_MINUTES: 30,
        CONNECTIVITY_FLAP_THRESHOLD: 3,
        CONNECTIVITY_INSTABILITY_ALERT_COOLDOWN_MINUTES: 60,
        MONITOR_INTERVAL_SECONDS: 60,
        ALERT_QUEUE_RETRY_DELAY_MS: 1500,
        LOG_LEVEL: 'info',
      }),
    );
  });

  it('rejects invalid URLs and enum values', () => {
    const result = envSchema.safeParse({
      DATABASE_URL: 'postgresql://user:pass@localhost:5432/app',
      AUTH_SECRET: 'super-secret-key',
      NODE_ENV: 'staging',
      N8N_OFFLINE_WEBHOOK_URL: 'not-a-url',
    });

    expect(result.success).toBe(false);
  });

  it('accepts empty webhook URLs as undefined', () => {
    const result = envSchema.parse({
      DATABASE_URL: 'postgresql://user:pass@localhost:5432/app',
      AUTH_SECRET: 'super-secret-key',
      N8N_ONLINE_WEBHOOK_URL: '   ',
      N8N_ENERGY_ALERT_WEBHOOK_URL: '',
    });

    expect(result.N8N_ONLINE_WEBHOOK_URL).toBeUndefined();
    expect(result.N8N_ENERGY_ALERT_WEBHOOK_URL).toBeUndefined();
  });
});
