import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { DevicesService } from './devices.service';
import { PrismaService } from '../../prisma/prisma.service';
import { CacheService } from '../../infra/cache/cache.service';
import { ConfigService } from '@nestjs/config';
import { AuditTrailService } from '../../infra/audit/audit-trail.service';

describe('DevicesService', () => {
  let service: DevicesService;
  let fakePrisma: any;
  let fakeCache: any;
  let fakeConfigService: any;

  beforeEach(async () => {
    fakePrisma = {
      device: {
        findUnique: jest.fn(),
        update: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        delete: jest.fn(),
      },
      temperatureLog: { findMany: jest.fn(), deleteMany: jest.fn() },
    };
    fakeCache = {
      get: jest.fn().mockReturnValue(null),
      set: jest.fn(),
      invalidatePrefix: jest.fn(),
    };
    fakeConfigService = {
      get: jest.fn((key: string) => {
        if (key === 'CACHE_TTL_SECONDS') return 15;
        return undefined;
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DevicesService,
        { provide: PrismaService, useValue: fakePrisma },
        { provide: CacheService, useValue: fakeCache },
        { provide: ConfigService, useValue: fakeConfigService },
        { provide: AuditTrailService, useValue: { record: jest.fn() } },
      ],
    }).compile();

    service = module.get<DevicesService>(DevicesService);
  });

  it('should update thresholds using update on existing device', async () => {
    const dto = { minTemperature: -10, maxTemperature: 5 };
    fakePrisma.device.findUnique.mockResolvedValue({ id: 'abc', clientId: 'client_a' });
    fakePrisma.device.update.mockResolvedValue({ id: 'abc', clientId: 'client_a', ...dto });

    const result = await service.update('abc', dto as any);
    expect(fakePrisma.device.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'abc' },
        data: expect.objectContaining(dto),
      }),
    );
    expect(result).toEqual({ id: 'abc', clientId: 'client_a', ...dto });
  });

  it('should create device', async () => {
    const dto = {
      id: 'freezer_01',
      clientId: 'client_a',
      name: 'Freezer',
      minTemperature: -20,
      maxTemperature: -10,
    };
    fakePrisma.device.create.mockResolvedValue(dto);

    const result = await service.create(dto as any);

    expect(fakePrisma.device.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          id: 'freezer_01',
          clientId: 'client_a',
          name: 'Freezer',
          minTemperature: -20,
          maxTemperature: -10,
        }),
      }),
    );
    expect(result).toEqual(dto);
  });

  it('should throw when minTemperature is greater than maxTemperature', async () => {
    await expect(
      service.update('abc', { minTemperature: 10, maxTemperature: 5 } as any),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(fakePrisma.device.update).not.toHaveBeenCalled();
  });

  it('should throw on create when minTemperature is greater than maxTemperature', async () => {
    await expect(
      service.create({
        id: 'freezer_01',
        minTemperature: 10,
        maxTemperature: 5,
      } as any),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(fakePrisma.device.create).not.toHaveBeenCalled();
  });

  it('should list devices with latest reading for dashboard', async () => {
    const now = new Date();
    fakePrisma.device.findMany.mockResolvedValue([
      {
        id: 'freezer_01',
        clientId: 'client_a',
        name: 'Freezer A',
        location: 'Kitchen',
        isOffline: false,
        lastSeen: now,
        offlineSince: null,
        minTemperature: -20,
        maxTemperature: -10,
      },
    ]);
    fakePrisma.temperatureLog.findMany.mockResolvedValue([
      {
        deviceId: 'freezer_01',
        temperature: -12.3,
        createdAt: now,
      },
    ]);

    const result = await service.listForDashboard();

    expect(fakePrisma.temperatureLog.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { deviceId: { in: ['freezer_01'] } },
        distinct: ['deviceId'],
      }),
    );
    expect(result).toEqual([
      expect.objectContaining({
        id: 'freezer_01',
        clientId: 'client_a',
        lastTemperature: -12.3,
        lastReadingAt: now,
      }),
    ]);
  });

  it('should filter dashboard list by clientId when provided', async () => {
    fakePrisma.device.findMany.mockResolvedValue([]);

    await service.listForDashboard('client_a');

    expect(fakePrisma.device.findMany).toHaveBeenCalledWith({
      where: { clientId: 'client_a' },
      orderBy: { id: 'asc' },
      take: 100,
    });
  });

  it('should return temperature history sorted by createdAt asc', async () => {
    const older = new Date('2026-03-01T10:00:00.000Z');
    const newer = new Date('2026-03-01T10:05:00.000Z');

    fakePrisma.temperatureLog.findMany.mockResolvedValue([
      { temperature: -10, createdAt: newer },
      { temperature: -12, createdAt: older },
    ]);

    const result = await service.getTemperatureHistory('freezer_01', 50);

    expect(fakePrisma.temperatureLog.findMany).toHaveBeenCalledWith({
      where: { deviceId: 'freezer_01' },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    expect(result).toEqual([
      { temperature: -12, createdAt: older },
      { temperature: -10, createdAt: newer },
    ]);
  });

  it('should delete device and its readings', async () => {
    fakePrisma.device.findUnique.mockResolvedValue({ id: 'freezer_01' });
    fakePrisma.temperatureLog.deleteMany.mockResolvedValue({ count: 10 });
    fakePrisma.device.delete.mockResolvedValue({ id: 'freezer_01' });

    const result = await service.remove('freezer_01');

    expect(fakePrisma.temperatureLog.deleteMany).toHaveBeenCalledWith({
      where: { deviceId: 'freezer_01' },
    });
    expect(fakePrisma.device.delete).toHaveBeenCalledWith({
      where: { id: 'freezer_01' },
    });
    expect(result).toEqual({ id: 'freezer_01' });
  });

  it('should throw not found when deleting unknown device', async () => {
    fakePrisma.device.findUnique.mockResolvedValue(null);

    await expect(service.remove('missing')).rejects.toBeInstanceOf(
      NotFoundException,
    );

    expect(fakePrisma.temperatureLog.deleteMany).not.toHaveBeenCalled();
    expect(fakePrisma.device.delete).not.toHaveBeenCalled();
  });

  it('should throw when findOne is requested with wrong clientId', async () => {
    fakePrisma.device.findUnique.mockResolvedValue({
      id: 'freezer_01',
      clientId: 'client_a',
    });

    await expect(service.findOne('freezer_01', 'client_b')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('should throw when deleting device with wrong clientId', async () => {
    fakePrisma.device.findUnique.mockResolvedValue({
      id: 'freezer_01',
      clientId: 'client_a',
    });

    await expect(service.remove('freezer_01', 'client_b')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('should throw when updating device with wrong clientId', async () => {
    fakePrisma.device.findUnique.mockResolvedValue({
      id: 'freezer_01',
      clientId: 'client_a',
    });

    await expect(
      service.update('freezer_01', { name: 'x' } as any, 'client_b'),
    ).rejects.toBeInstanceOf(NotFoundException);

    expect(fakePrisma.device.update).not.toHaveBeenCalled();
  });

  it('should throw when query clientId conflicts with body clientId', async () => {
    await expect(
      service.update(
        'freezer_01',
        { clientId: 'client_b', name: 'x' } as any,
        'client_a',
      ),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(fakePrisma.device.update).not.toHaveBeenCalled();
  });
});
