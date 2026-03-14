import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { PrismaService } from '../src/prisma/prisma.service';
import { AlertRulesController } from '../src/modules/alert-rules/alert-rules.controller';
import { AlertRulesService } from '../src/modules/alert-rules/alert-rules.service';
import { ModuleAccessGuard, SessionAuthGuard } from '../src/modules/auth/auth.guards';

describe('Alert Rules (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const clients = [{ id: 'client_a', name: 'Client A' }];
    const devices = [{ id: 'freezer_01', clientId: 'client_a' }];
    const rules = new Map<string, any>();

    const fakePrisma = {
      client: {
        findUnique: jest.fn(({ where }: any) =>
          Promise.resolve(clients.find((c) => c.id === where.id) ?? null),
        ),
      },
      device: {
        findUnique: jest.fn(({ where }: any) =>
          Promise.resolve(devices.find((d) => d.id === where.id) ?? null),
        ),
      },
      alertRule: {
        create: jest.fn(({ data }: any) => {
          const row = {
            id: `rule_${rules.size + 1}`,
            createdAt: new Date(),
            updatedAt: new Date(),
            ...data,
          };
          rules.set(row.id, row);
          return Promise.resolve(row);
        }),
        findMany: jest.fn(({ where }: any) => {
          let values = Array.from(rules.values());
          if (where?.clientId) values = values.filter((r) => r.clientId === where.clientId);
          if (where?.deviceId) values = values.filter((r) => r.deviceId === where.deviceId);
          if (where?.sensorType) values = values.filter((r) => r.sensorType === where.sensorType);
          if (typeof where?.enabled === 'boolean') values = values.filter((r) => r.enabled === where.enabled);
          return Promise.resolve(values);
        }),
        findUnique: jest.fn(({ where }: any) =>
          Promise.resolve(rules.get(where.id) ?? null),
        ),
        update: jest.fn(({ where, data }: any) => {
          const current = rules.get(where.id);
          const updated = { ...current, ...data, updatedAt: new Date() };
          rules.set(where.id, updated);
          return Promise.resolve(updated);
        }),
        delete: jest.fn(({ where }: any) => {
          const row = rules.get(where.id);
          rules.delete(where.id);
          return Promise.resolve(row);
        }),
      },
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [AlertRulesController],
      providers: [
        AlertRulesService,
        { provide: PrismaService, useValue: fakePrisma },
      ],
    })
      .overrideGuard(SessionAuthGuard)
      .useValue({
        canActivate: (context: any) => {
          context.switchToHttp().getRequest().authUser = {
            id: 'user_admin',
            clientId: null,
            name: 'Admin Global',
            email: 'admin@example.com',
            role: 'admin',
            phone: null,
            isActive: true,
            lastLoginAt: null,
            createdAt: new Date('2026-03-13T00:00:00.000Z'),
            updatedAt: new Date('2026-03-13T00:00:00.000Z'),
          };
          return true;
        },
      })
      .overrideGuard(ModuleAccessGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterEach(async () => {
    if (app) await app.close();
  });

  it('should create and filter alert rules', async () => {
    await request(app.getHttpServer())
      .post('/alert-rules')
      .send({
        clientId: 'client_a',
        deviceId: 'freezer_01',
        sensorType: 'temperature',
        minValue: -20,
        maxValue: -10,
        cooldownMinutes: 5,
        toleranceMinutes: 2,
        enabled: true,
      })
      .expect(201);

    await request(app.getHttpServer())
      .get('/alert-rules?clientId=client_a&sensorType=temperature')
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveLength(1);
        expect(res.body[0]).toEqual(
          expect.objectContaining({
            clientId: 'client_a',
            deviceId: 'freezer_01',
            toleranceMinutes: 2,
          }),
        );
      });
  });

  it('should reject when minValue is greater than maxValue', async () => {
    await request(app.getHttpServer())
      .post('/alert-rules')
      .send({
        clientId: 'client_a',
        sensorType: 'temperature',
        minValue: 10,
        maxValue: 5,
      })
      .expect(400);
  });

  it('should reject when device does not belong to client', async () => {
    await request(app.getHttpServer())
      .post('/alert-rules')
      .send({
        clientId: 'client_a',
        deviceId: 'freezer_999',
        sensorType: 'temperature',
      })
      .expect(400);
  });

  it('should reject when cooldownMinutes is less than 1', async () => {
    await request(app.getHttpServer())
      .post('/alert-rules')
      .send({
        clientId: 'client_a',
        sensorType: 'temperature',
        cooldownMinutes: 0,
      })
      .expect(400);
  });

  it('should reject when toleranceMinutes is negative', async () => {
    await request(app.getHttpServer())
      .post('/alert-rules')
      .send({
        clientId: 'client_a',
        sensorType: 'temperature',
        toleranceMinutes: -1,
      })
      .expect(400);
  });
});
