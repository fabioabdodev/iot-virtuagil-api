import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../prisma/prisma.service';
import { AlertRulesService } from './alert-rules.service';
import { AuditTrailService } from '../../infra/audit/audit-trail.service';

describe('AlertRulesService', () => {
  let service: AlertRulesService;
  let fakePrisma: any;

  beforeEach(async () => {
    fakePrisma = {
      client: {
        findUnique: jest.fn(),
      },
      device: {
        findUnique: jest.fn(),
      },
      alertRule: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AlertRulesService,
        { provide: PrismaService, useValue: fakePrisma },
        { provide: AuditTrailService, useValue: { record: jest.fn() } },
      ],
    }).compile();

    service = module.get<AlertRulesService>(AlertRulesService);
  });

  it('should create alert rule', async () => {
    fakePrisma.client.findUnique.mockResolvedValue({ id: 'client_a' });
    fakePrisma.device.findUnique.mockResolvedValue({
      id: 'freezer_01',
      clientId: 'client_a',
    });
    fakePrisma.alertRule.create.mockResolvedValue({ id: 'rule_1' });

    const result = await service.create({
      clientId: 'client_a',
      deviceId: 'freezer_01',
      sensorType: 'temperature',
      minValue: -20,
      maxValue: -10,
    } as any);

    expect(result).toEqual({ id: 'rule_1' });
  });

  it('should throw when minValue is greater than maxValue', async () => {
    await expect(
      service.create({
        clientId: 'client_a',
        sensorType: 'temperature',
        minValue: 10,
        maxValue: 5,
      } as any),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('should throw when alert rule is not found', async () => {
    fakePrisma.alertRule.findUnique.mockResolvedValue(null);
    await expect(service.findOne('missing')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('should update alert rule preserving client and device validation', async () => {
    fakePrisma.alertRule.findUnique.mockResolvedValueOnce({
      id: 'rule_1',
      clientId: 'client_a',
      deviceId: 'freezer_01',
      minValue: -20,
      maxValue: -10,
    });
    fakePrisma.client.findUnique.mockResolvedValue({ id: 'client_a' });
    fakePrisma.device.findUnique.mockResolvedValue({
      id: 'freezer_01',
      clientId: 'client_a',
    });
    fakePrisma.alertRule.update.mockResolvedValue({
      id: 'rule_1',
      toleranceMinutes: 3,
    });

    const result = await service.update('rule_1', {
      toleranceMinutes: 3,
    } as any);

    expect(result).toEqual({ id: 'rule_1', toleranceMinutes: 3 });
    expect(fakePrisma.alertRule.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'rule_1' },
      }),
    );
  });
});
