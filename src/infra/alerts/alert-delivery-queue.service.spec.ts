import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { AlertDeliveryQueueService } from './alert-delivery-queue.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('AlertDeliveryQueueService', () => {
  let service: AlertDeliveryQueueService;
  let fakeConfigService: any;
  let fakePrismaService: any;
  let fetchMock: jest.Mock;

  beforeEach(async () => {
    jest.useFakeTimers();
    fetchMock = jest.fn().mockResolvedValue({ ok: true });
    (global as any).fetch = fetchMock;

    fakeConfigService = {
      get: jest.fn((key: string) => {
        if (key === 'N8N_TEMPERATURE_ALERT_WEBHOOK_URL')
          return 'https://example.com/webhook';
        if (key === 'N8N_OFFLINE_WEBHOOK_URL')
          return 'https://example.com/offline-webhook';
        if (key === 'N8N_ONLINE_WEBHOOK_URL')
          return 'https://example.com/online-webhook';
        if (key === 'ALERT_QUEUE_BATCH_SIZE') return 20;
        if (key === 'ALERT_QUEUE_RETRY_MAX') return 3;
        if (key === 'ALERT_QUEUE_RETRY_DELAY_MS') return 1000;
        return undefined;
      }),
    };

    fakePrismaService = {
      client: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'client_a',
          name: 'Sabor da Serra',
          document: '11222333000181',
          alertPhone: '5531999999999',
          adminPhone: '5531888888888',
          phone: '5531777777777',
        }),
      },
      device: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'dev1',
          name: 'Adega Vinhos',
          location: 'Unidade Centro',
        }),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AlertDeliveryQueueService,
        { provide: ConfigService, useValue: fakeConfigService },
        { provide: PrismaService, useValue: fakePrismaService },
      ],
    }).compile();

    service = module.get<AlertDeliveryQueueService>(AlertDeliveryQueueService);
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('should enqueue and deliver alert payload', async () => {
    service.enqueue({
      type: 'temperature_out_of_range',
      clientId: 'client_a',
      ruleId: 'rule_1',
      deviceId: 'dev1',
      temperature: 10,
      minTemperature: 0,
      maxTemperature: 5,
      occurredAt: new Date().toISOString(),
    });

    await jest.advanceTimersByTimeAsync(1100);

    expect(fetchMock).toHaveBeenCalled();
    expect(fetchMock).toHaveBeenCalledWith(
      'https://example.com/webhook',
      expect.objectContaining({
        body: expect.stringContaining('"recipient_phone":"5531999999999"'),
      }),
    );
  });

  it('should enqueue and deliver offline alert payload', async () => {
    service.enqueue({
      type: 'device_offline',
      clientId: 'client_a',
      deviceId: 'dev1',
      lastSeenAt: new Date('2026-03-12T10:00:00.000Z').toISOString(),
      offlineSince: new Date('2026-03-12T10:06:00.000Z').toISOString(),
    });

    await jest.advanceTimersByTimeAsync(1100);

    expect(fetchMock).toHaveBeenCalledWith(
      'https://example.com/offline-webhook',
      expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('"recipient_phone":"5531999999999"'),
      }),
    );
  });

  it('should enqueue and deliver online recovery alert payload', async () => {
    service.enqueue({
      type: 'device_back_online',
      clientId: 'client_a',
      deviceId: 'dev1',
      lastSeenAt: new Date('2026-03-12T10:00:00.000Z').toISOString(),
      offlineSince: new Date('2026-03-12T10:06:00.000Z').toISOString(),
      cameOnlineAt: new Date('2026-03-12T10:08:00.000Z').toISOString(),
    });

    await jest.advanceTimersByTimeAsync(1100);

    expect(fetchMock).toHaveBeenCalledWith(
      'https://example.com/online-webhook',
      expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('"recipient_phone":"5531999999999"'),
      }),
    );
  });

  it('should enqueue and deliver connectivity instability payload through online webhook', async () => {
    service.enqueue({
      type: 'device_connectivity_instability',
      clientId: 'client_a',
      deviceId: 'dev1',
      offlineSince: new Date('2026-03-12T10:06:00.000Z').toISOString(),
      cameOnlineAt: new Date('2026-03-12T10:08:00.000Z').toISOString(),
      flapCount: 3,
      windowMinutes: 30,
    });

    await jest.advanceTimersByTimeAsync(1100);

    expect(fetchMock).toHaveBeenCalledWith(
      'https://example.com/online-webhook',
      expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('"flap_count":3'),
      }),
    );
  });
});
