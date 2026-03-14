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

describe('Devices CRUD (e2e)', () => {
  let app: INestApplication;
  let fakePrisma: any;

  beforeEach(async () => {
    const devices = new Map<string, any>();
    const temperatureLogs: Array<{
      deviceId: string;
      temperature: number;
      createdAt: Date;
    }> = [];

    fakePrisma = {
      clientModule: {
        findUnique: jest.fn(() =>
          Promise.resolve({ enabled: true }),
        ),
      },
      device: {
        create: jest.fn(({ data }: any) => {
          const row = { ...data, lastSeen: null, offlineSince: null };
          devices.set(data.id, row);
          return Promise.resolve(row);
        }),
        findUnique: jest.fn(({ where }: any) => {
          return Promise.resolve(devices.get(where.id) ?? null);
        }),
        findMany: jest.fn(({ orderBy }: any = {}) => {
          const values = Array.from(devices.values());
          if (orderBy?.id === 'asc') {
            values.sort((a, b) => a.id.localeCompare(b.id));
          }
          return Promise.resolve(values);
        }),
        upsert: jest.fn(({ where, update, create }: any) => {
          const current = devices.get(where.id);
          if (current) {
            const merged = { ...current, ...update };
            devices.set(where.id, merged);
            return Promise.resolve(merged);
          }
          const row = { ...create, lastSeen: null, offlineSince: null };
          devices.set(where.id, row);
          return Promise.resolve(row);
        }),
        delete: jest.fn(({ where }: any) => {
          const row = devices.get(where.id);
          devices.delete(where.id);
          return Promise.resolve(row);
        }),
        update: jest.fn(({ where, data }: any) => {
          const current = devices.get(where.id);
          const updated = { ...current, ...data };
          devices.set(where.id, updated);
          return Promise.resolve(updated);
        }),
      },
      temperatureLog: {
        findMany: jest.fn(({ where, orderBy, take }: any = {}) => {
          let rows = temperatureLogs.slice();
          if (where?.deviceId?.in) {
            rows = rows.filter((r) => where.deviceId.in.includes(r.deviceId));
          } else if (where?.deviceId) {
            rows = rows.filter((r) => r.deviceId === where.deviceId);
          }

          if (Array.isArray(orderBy)) {
            rows.sort((a, b) => {
              if (a.deviceId !== b.deviceId) {
                return a.deviceId.localeCompare(b.deviceId);
              }
              return b.createdAt.getTime() - a.createdAt.getTime();
            });
          } else if (orderBy?.createdAt === 'desc') {
            rows.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
          }

          if (typeof take === 'number') rows = rows.slice(0, take);
          return Promise.resolve(rows);
        }),
        deleteMany: jest.fn(({ where }: any) => {
          const before = temperatureLogs.length;
          for (let i = temperatureLogs.length - 1; i >= 0; i -= 1) {
            if (temperatureLogs[i].deviceId === where.deviceId) {
              temperatureLogs.splice(i, 1);
            }
          }
          return Promise.resolve({ count: before - temperatureLogs.length });
        }),
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
          context.switchToHttp().getRequest().authUser = {
            id: 'user_admin',
            clientId: null,
            name: 'Admin Virtuagil',
            email: 'admin@virtuagil.com.br',
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

  it('POST /devices should create a device', async () => {
    await request(app.getHttpServer())
      .post('/devices')
      .send({
        id: 'freezer_01',
        name: 'Freezer A',
        minTemperature: -20,
        maxTemperature: -10,
      })
      .expect(201)
      .expect((res) => {
        expect(res.body).toEqual(
          expect.objectContaining({
            id: 'freezer_01',
            name: 'Freezer A',
            minTemperature: -20,
            maxTemperature: -10,
          }),
        );
      });
  });

  it('PATCH /devices/:id should return 400 when minTemperature > maxTemperature', async () => {
    await request(app.getHttpServer())
      .patch('/devices/freezer_01')
      .send({ minTemperature: 10, maxTemperature: 5 })
      .expect(400);
  });

  it('PATCH /devices/:id should update device fields', async () => {
    await request(app.getHttpServer())
      .post('/devices')
      .send({
        id: 'freezer_01',
        minTemperature: -20,
        maxTemperature: -10,
      })
      .expect(201);

    await request(app.getHttpServer())
      .patch('/devices/freezer_01')
      .send({ name: 'Freezer Updated', location: 'Lab' })
      .expect(200)
      .expect((res) => {
        expect(res.body).toEqual(
          expect.objectContaining({
            id: 'freezer_01',
            name: 'Freezer Updated',
            location: 'Lab',
          }),
        );
      });
  });

  it('DELETE /devices/:id should return 404 when device does not exist', async () => {
    await request(app.getHttpServer()).delete('/devices/missing').expect(404);
  });

  it('DELETE /devices/:id should remove existing device', async () => {
    await request(app.getHttpServer())
      .post('/devices')
      .send({ id: 'freezer_01' })
      .expect(201);

    await request(app.getHttpServer())
      .delete('/devices/freezer_01')
      .expect(200)
      .expect((res) => {
        expect(res.body).toEqual(expect.objectContaining({ id: 'freezer_01' }));
      });

    await request(app.getHttpServer()).delete('/devices/freezer_01').expect(404);
  });
});
