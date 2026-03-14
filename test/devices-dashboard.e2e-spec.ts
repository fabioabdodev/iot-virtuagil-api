import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { DevicesController } from '../src/modules/devices/devices.controller';
import { DevicesService } from '../src/modules/devices/devices.service';
import { PrismaService } from '../src/prisma/prisma.service';
import { CacheService } from '../src/infra/cache/cache.service';
import { ConfigService } from '@nestjs/config';
import { ModuleAccessGuard, SessionAuthGuard } from '../src/modules/auth/auth.guards';

describe('Devices Dashboard (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const devices = [
      {
        id: 'freezer_01',
        clientId: 'client_a',
        name: 'Freezer A',
        location: 'Kitchen',
        isOffline: false,
        lastSeen: new Date('2026-03-06T10:00:00.000Z'),
        offlineSince: null,
        minTemperature: -20,
        maxTemperature: -10,
      },
      {
        id: 'freezer_02',
        clientId: 'client_b',
        name: 'Freezer B',
        location: 'Lab',
        isOffline: true,
        lastSeen: new Date('2026-03-06T09:00:00.000Z'),
        offlineSince: new Date('2026-03-06T09:30:00.000Z'),
        minTemperature: -25,
        maxTemperature: -12,
      },
    ];

    const logs = [
      {
        deviceId: 'freezer_01',
        temperature: -13.2,
        createdAt: new Date('2026-03-06T09:55:00.000Z'),
      },
      {
        deviceId: 'freezer_01',
        temperature: -12.8,
        createdAt: new Date('2026-03-06T10:05:00.000Z'),
      },
      {
        deviceId: 'freezer_02',
        temperature: -11.5,
        createdAt: new Date('2026-03-06T08:55:00.000Z'),
      },
    ];

    const fakePrisma = {
      device: {
        findMany: jest.fn(({ where, orderBy, take }: any = {}) => {
          let values = devices.slice();
          if (where?.clientId) {
            values = values.filter((d) => d.clientId === where.clientId);
          }
          if (orderBy?.id === 'asc') values.sort((a, b) => a.id.localeCompare(b.id));
          if (typeof take === 'number') values = values.slice(0, take);
          return Promise.resolve(values);
        }),
      },
      temperatureLog: {
        findMany: jest.fn((args: any = {}) => {
          let rows = logs.slice();

          if (args.where?.deviceId?.in) {
            rows = rows.filter((r) => args.where.deviceId.in.includes(r.deviceId));
          } else if (args.where?.deviceId) {
            rows = rows.filter((r) => r.deviceId === args.where.deviceId);
          }

          if (args.distinct?.includes('deviceId')) {
            const latest = new Map<string, any>();
            for (const row of rows) {
              const current = latest.get(row.deviceId);
              if (!current || row.createdAt > current.createdAt) {
                latest.set(row.deviceId, row);
              }
            }
            rows = Array.from(latest.values());
          } else if (args.orderBy?.createdAt === 'desc') {
            rows.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
          }

          if (typeof args.take === 'number') {
            rows = rows.slice(0, args.take);
          }

          return Promise.resolve(rows);
        }),
      },
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [DevicesController],
      providers: [
        DevicesService,
        { provide: PrismaService, useValue: fakePrisma },
        {
          provide: CacheService,
          useValue: { get: jest.fn().mockReturnValue(null), set: jest.fn() },
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

  it('GET /devices should return dashboard summary with last readings', async () => {
    await request(app.getHttpServer())
      .get('/devices')
      .expect(200)
      .expect((res) => {
        expect(res.body).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              id: 'freezer_01',
              clientId: 'client_a',
              isOffline: false,
              lastTemperature: -12.8,
            }),
            expect.objectContaining({
              id: 'freezer_02',
              clientId: 'client_b',
              isOffline: true,
              lastTemperature: -11.5,
            }),
          ]),
        );
      });
  });

  it('GET /devices?clientId=... should filter dashboard list by client', async () => {
    await request(app.getHttpServer())
      .get('/devices?clientId=client_a')
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveLength(1);
        expect(res.body[0]).toEqual(
          expect.objectContaining({
            id: 'freezer_01',
            clientId: 'client_a',
          }),
        );
      });
  });

  it('GET /devices?limit=1 should return limited dashboard rows', async () => {
    await request(app.getHttpServer())
      .get('/devices?limit=1')
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveLength(1);
      });
  });

  it('GET /devices/:id/readings should return chronological readings and apply limit', async () => {
    await request(app.getHttpServer())
      .get('/devices/freezer_01/readings?limit=2')
      .expect(200)
      .expect((res) => {
        expect(res.body).toEqual([
          {
            temperature: -13.2,
            createdAt: '2026-03-06T09:55:00.000Z',
          },
          {
            temperature: -12.8,
            createdAt: '2026-03-06T10:05:00.000Z',
          },
        ]);
      });
  });

  it('GET /devices/:id/readings should handle invalid limit safely', async () => {
    await request(app.getHttpServer())
      .get('/devices/freezer_01/readings?limit=abc')
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBe(true);
      });
  });
});
