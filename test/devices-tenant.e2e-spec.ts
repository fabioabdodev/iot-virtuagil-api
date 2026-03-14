import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { DevicesController } from '../src/modules/devices/devices.controller';
import { DevicesService } from '../src/modules/devices/devices.service';
import { PrismaService } from '../src/prisma/prisma.service';
import { CacheService } from '../src/infra/cache/cache.service';
import { ConfigService } from '@nestjs/config';
import { ModuleAccessGuard, SessionAuthGuard } from '../src/modules/auth/auth.guards';
import { AuditTrailService } from '../src/infra/audit/audit-trail.service';

describe('Devices Tenant Isolation (e2e)', () => {
  let app: INestApplication;
  let authUser: any;

  beforeEach(async () => {
    authUser = {
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
    const devices = new Map<string, any>();

    const fakePrisma = {
      device: {
        create: jest.fn(({ data }: any) => {
          const row = { ...data, isOffline: false, lastSeen: null, offlineSince: null };
          devices.set(data.id, row);
          return Promise.resolve(row);
        }),
        findUnique: jest.fn(({ where }: any) =>
          Promise.resolve(devices.get(where.id) ?? null),
        ),
        findMany: jest.fn(({ where, orderBy }: any = {}) => {
          let rows = Array.from(devices.values());
          if (where?.clientId) rows = rows.filter((d: any) => d.clientId === where.clientId);
          if (orderBy?.id === 'asc') rows.sort((a: any, b: any) => a.id.localeCompare(b.id));
          return Promise.resolve(rows);
        }),
        update: jest.fn(({ where, data }: any) => {
          const current = devices.get(where.id);
          const updated = { ...current, ...data };
          devices.set(where.id, updated);
          return Promise.resolve(updated);
        }),
        delete: jest.fn(({ where }: any) => {
          const row = devices.get(where.id);
          devices.delete(where.id);
          return Promise.resolve(row);
        }),
      },
      auditLog: {
        create: jest.fn(({ data }: any) => Promise.resolve(data)),
      },
      temperatureLog: {
        findMany: jest.fn(() => Promise.resolve([])),
        deleteMany: jest.fn(() => Promise.resolve({ count: 0 })),
      },
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [DevicesController],
      providers: [
        DevicesService,
        { provide: PrismaService, useValue: fakePrisma },
        { provide: AuditTrailService, useValue: { record: jest.fn() } },
        {
          provide: CacheService,
          useValue: {
            get: jest.fn().mockReturnValue(null),
            set: jest.fn(),
            invalidatePrefix: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: { get: jest.fn((key: string) => (key === 'CACHE_TTL_SECONDS' ? 15 : undefined)) },
        },
      ],
    })
      .overrideGuard(SessionAuthGuard)
      .useValue({
        canActivate: (context: any) => {
          context.switchToHttp().getRequest().authUser = authUser;
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

  it('should isolate GET/PATCH/DELETE by clientId', async () => {
    await request(app.getHttpServer())
      .post('/devices')
      .send({ id: 'freezer_01', clientId: 'client_a' })
      .expect(201);

    await request(app.getHttpServer())
      .get('/devices/freezer_01?clientId=client_a')
      .expect(200);

    await request(app.getHttpServer())
      .get('/devices/freezer_01?clientId=client_b')
      .expect(404);

    await request(app.getHttpServer())
      .patch('/devices/freezer_01?clientId=client_b')
      .send({ name: 'X' })
      .expect(404);

    await request(app.getHttpServer())
      .patch('/devices/freezer_01?clientId=client_a')
      .send({ clientId: 'client_b', name: 'X' })
      .expect(400);

    await request(app.getHttpServer())
      .delete('/devices/freezer_01?clientId=client_b')
      .expect(404);

    await request(app.getHttpServer())
      .delete('/devices/freezer_01?clientId=client_a')
      .expect(200);
  });

  it('should allow tenant admin to update only temperature bounds', async () => {
    const server = app.getHttpServer();

    await request(server)
      .post('/devices')
      .send({ id: 'freezer_02', clientId: 'client_a', name: 'Freezer A' })
      .expect(201);

    authUser = {
      ...authUser,
      id: 'tenant_admin',
      clientId: 'client_a',
      email: 'admin@client-a.com',
    };

    await request(server)
      .patch('/devices/freezer_02?clientId=client_a')
      .send({ minTemperature: -25, maxTemperature: -15 })
      .expect(200)
      .expect((res) => {
        expect(res.body).toMatchObject({
          id: 'freezer_02',
          minTemperature: -25,
          maxTemperature: -15,
        });
      });

    await request(server)
      .patch('/devices/freezer_02?clientId=client_a')
      .send({ name: 'Nome proibido' })
      .expect(403);

    await request(server)
      .delete('/devices/freezer_02?clientId=client_a')
      .expect(403);
  });
});
