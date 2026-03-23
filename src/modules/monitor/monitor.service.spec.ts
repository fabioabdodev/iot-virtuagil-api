import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { MonitorService } from './monitor.service';
import { PrismaService } from '../../prisma/prisma.service';
import { AlertDeliveryQueueService } from '../../infra/alerts/alert-delivery-queue.service';
import { ConnectivityAlertPolicyService } from '../../infra/alerts/connectivity-alert-policy.service';

describe('MonitorService', () => {
  let service: MonitorService;
  let fakePrisma: any;
  let fakeConfigService: any;
  let fakeAlertQueue: { enqueue: jest.Mock };
  let fakeConnectivityAlertPolicy: { handleOfflineTransition: jest.Mock };

  beforeEach(async () => {
    fakePrisma = {
      device: {
        count: jest.fn().mockResolvedValue(0),
        findMany: jest.fn().mockResolvedValue([]),
        findUnique: jest.fn(),
        update: jest.fn().mockResolvedValue(undefined),
      },
      temperatureLog: {
        findFirst: jest.fn(),
      },
      sensorReading: {
        findFirst: jest.fn(),
      },
      alertRule: {
        findMany: jest.fn((params: any) => {
          const sensorType = params?.where?.sensorType;
          if (sensorType === 'temperature') return Promise.resolve([]);
          if (sensorType?.in) return Promise.resolve([]);
          return Promise.resolve([]);
        }),
      },
      alertRuleState: {
        upsert: jest.fn(),
        update: jest.fn().mockResolvedValue(undefined),
      },
    };

    fakeConfigService = {
      get: jest.fn((key: string) => {
        if (key === 'DEVICE_OFFLINE_MINUTES') return 5;
        if (key === 'TEMPERATURE_ALERT_COOLDOWN_MINUTES') return 5;
        return undefined;
      }),
    };
    fakeAlertQueue = { enqueue: jest.fn() };
    fakeConnectivityAlertPolicy = {
      handleOfflineTransition: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MonitorService,
        { provide: PrismaService, useValue: fakePrisma },
        { provide: ConfigService, useValue: fakeConfigService },
        { provide: AlertDeliveryQueueService, useValue: fakeAlertQueue },
        {
          provide: ConnectivityAlertPolicyService,
          useValue: fakeConnectivityAlertPolicy,
        },
      ],
    }).compile();

    service = module.get<MonitorService>(MonitorService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('enqueues offline alert when a device crosses offline threshold', async () => {
    const now = new Date('2026-03-07T10:00:00.000Z');
    jest.spyOn(Date, 'now').mockReturnValue(now.getTime());

    fakePrisma.device.count.mockResolvedValue(1);
    fakePrisma.device.findMany.mockResolvedValueOnce([
      {
        id: 'dev1',
        clientId: 'client_a',
        lastSeen: new Date('2026-03-07T09:40:00.000Z'),
        isOffline: false,
      },
    ]);
    fakeConnectivityAlertPolicy.handleOfflineTransition.mockReturnValue({
      type: 'device_offline',
      clientId: 'client_a',
      deviceId: 'dev1',
      lastSeenAt: '2026-03-07T09:40:00.000Z',
      offlineSince: '2026-03-07T10:00:00.000Z',
    });

    await service.checkOfflineDevices();

    expect(fakeAlertQueue.enqueue).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'device_offline',
        deviceId: 'dev1',
        clientId: 'client_a',
      }),
    );
  });

  it('enqueues instability alert instead of repeated offline alert when policy detects flapping', async () => {
    const now = new Date('2026-03-07T10:00:00.000Z');
    jest.spyOn(Date, 'now').mockReturnValue(now.getTime());

    fakePrisma.device.count.mockResolvedValue(1);
    fakePrisma.device.findMany.mockResolvedValueOnce([
      {
        id: 'dev1',
        clientId: 'client_a',
        lastSeen: new Date('2026-03-07T09:40:00.000Z'),
        isOffline: false,
      },
    ]);
    fakeConnectivityAlertPolicy.handleOfflineTransition.mockReturnValue({
      type: 'device_connectivity_instability',
      clientId: 'client_a',
      deviceId: 'dev1',
      offlineSince: '2026-03-07T10:00:00.000Z',
      cameOnlineAt: '2026-03-07T09:40:00.000Z',
      flapCount: 3,
      windowMinutes: 30,
    });

    await service.checkOfflineDevices();

    expect(fakeAlertQueue.enqueue).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'device_connectivity_instability',
        deviceId: 'dev1',
      }),
    );
  });

  it('suppresses offline alert when policy says the oscillation is already under cooldown', async () => {
    const now = new Date('2026-03-07T10:00:00.000Z');
    jest.spyOn(Date, 'now').mockReturnValue(now.getTime());

    fakePrisma.device.count.mockResolvedValue(1);
    fakePrisma.device.findMany.mockResolvedValueOnce([
      {
        id: 'dev1',
        clientId: 'client_a',
        lastSeen: new Date('2026-03-07T09:40:00.000Z'),
        isOffline: false,
      },
    ]);
    fakeConnectivityAlertPolicy.handleOfflineTransition.mockReturnValue(null);

    await service.checkOfflineDevices();

    expect(fakeAlertQueue.enqueue).not.toHaveBeenCalled();
  });

  it('enqueues alert when configured temperature rule is violated', async () => {
    const now = new Date('2026-03-07T10:00:00.000Z');
    jest.spyOn(Date, 'now').mockReturnValue(now.getTime());

    fakePrisma.alertRule.findMany.mockImplementation((params: any) => {
      const sensorType = params?.where?.sensorType;
      if (sensorType === 'temperature') {
        return Promise.resolve([
          {
            id: 'rule_1',
            clientId: 'client_a',
            deviceId: 'dev1',
            sensorType: 'temperature',
            minValue: 0,
            maxValue: 10,
            cooldownMinutes: 5,
            toleranceMinutes: 0,
            enabled: true,
          },
        ]);
      }
      if (sensorType?.in) return Promise.resolve([]);
      return Promise.resolve([]);
    });

    fakePrisma.device.findUnique.mockResolvedValue({
      id: 'dev1',
      clientId: 'client_a',
    });
    fakePrisma.temperatureLog.findFirst.mockResolvedValue({ temperature: 15 });
    fakePrisma.alertRuleState.upsert.mockResolvedValue({
      id: 'state_1',
      breachStartedAt: null,
      lastTriggeredAt: null,
    });

    await service.checkOfflineDevices();

    expect(fakeAlertQueue.enqueue).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'temperature_out_of_range',
        deviceId: 'dev1',
      }),
    );
    expect(fakePrisma.alertRuleState.update).toHaveBeenCalled();
  });

  it('does not send webhook before tolerance window is reached', async () => {
    const now = new Date('2026-03-07T10:00:00.000Z');
    jest.spyOn(Date, 'now').mockReturnValue(now.getTime());

    fakePrisma.alertRule.findMany.mockImplementation((params: any) => {
      const sensorType = params?.where?.sensorType;
      if (sensorType === 'temperature') {
        return Promise.resolve([
          {
            id: 'rule_1',
            clientId: 'client_a',
            deviceId: 'dev1',
            sensorType: 'temperature',
            minValue: 0,
            maxValue: 10,
            cooldownMinutes: 5,
            toleranceMinutes: 10,
            enabled: true,
          },
        ]);
      }
      if (sensorType?.in) return Promise.resolve([]);
      return Promise.resolve([]);
    });

    fakePrisma.device.findUnique.mockResolvedValue({
      id: 'dev1',
      clientId: 'client_a',
    });
    fakePrisma.temperatureLog.findFirst.mockResolvedValue({ temperature: 15 });
    fakePrisma.alertRuleState.upsert.mockResolvedValue({
      id: 'state_1',
      breachStartedAt: now,
      lastTriggeredAt: null,
    });

    await service.checkOfflineDevices();

    expect(fakeAlertQueue.enqueue).not.toHaveBeenCalled();
  });

  it('does not send webhook while cooldown is still active', async () => {
    const now = new Date('2026-03-07T10:00:00.000Z');
    jest.spyOn(Date, 'now').mockReturnValue(now.getTime());

    fakePrisma.alertRule.findMany.mockImplementation((params: any) => {
      const sensorType = params?.where?.sensorType;
      if (sensorType === 'temperature') {
        return Promise.resolve([
          {
            id: 'rule_1',
            clientId: 'client_a',
            deviceId: 'dev1',
            sensorType: 'temperature',
            minValue: 0,
            maxValue: 10,
            cooldownMinutes: 5,
            toleranceMinutes: 0,
            enabled: true,
          },
        ]);
      }
      if (sensorType?.in) return Promise.resolve([]);
      return Promise.resolve([]);
    });

    fakePrisma.device.findUnique.mockResolvedValue({
      id: 'dev1',
      clientId: 'client_a',
    });
    fakePrisma.temperatureLog.findFirst.mockResolvedValue({ temperature: 15 });
    fakePrisma.alertRuleState.upsert.mockResolvedValue({
      id: 'state_1',
      breachStartedAt: new Date('2026-03-07T09:50:00.000Z'),
      lastTriggeredAt: new Date('2026-03-07T09:57:00.000Z'),
    });

    await service.checkOfflineDevices();

    expect(fakeAlertQueue.enqueue).not.toHaveBeenCalled();
  });

  it('enqueues alert when configured energy rule is violated', async () => {
    const now = new Date('2026-03-07T10:00:00.000Z');
    jest.spyOn(Date, 'now').mockReturnValue(now.getTime());

    fakePrisma.alertRule.findMany.mockImplementation((params: any) => {
      const sensorType = params?.where?.sensorType;
      if (sensorType === 'temperature') return Promise.resolve([]);
      if (sensorType?.in) {
        return Promise.resolve([
          {
            id: 'rule_energy_1',
            clientId: 'client_a',
            deviceId: 'dev1',
            sensorType: 'consumo',
            minValue: 2,
            maxValue: 8,
            cooldownMinutes: 5,
            toleranceMinutes: 0,
            enabled: true,
          },
        ]);
      }
      return Promise.resolve([]);
    });

    fakePrisma.device.findUnique.mockResolvedValue({
      id: 'dev1',
      clientId: 'client_a',
    });
    fakePrisma.sensorReading.findFirst.mockResolvedValue({
      value: 9.8,
      unit: 'kwh',
      createdAt: new Date('2026-03-07T10:00:00.000Z'),
    });
    fakePrisma.alertRuleState.upsert.mockResolvedValue({
      id: 'state_energy_1',
      breachStartedAt: null,
      lastTriggeredAt: null,
    });

    await service.checkOfflineDevices();

    expect(fakeAlertQueue.enqueue).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'energy_out_of_range',
        deviceId: 'dev1',
        sensorType: 'consumo',
      }),
    );
  });
});
