import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { PrismaService } from '../src/prisma/prisma.service';
import { ReadingsController } from '../src/modules/readings/readings.controller';
import { ReadingsService } from '../src/modules/readings/readings.service';
import { CacheService } from '../src/infra/cache/cache.service';
import { ConfigService } from '@nestjs/config';
import { ModuleAccessGuard, SessionAuthGuard } from '../src/modules/auth/auth.guards';

describe('Readings (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const devices = [
      { id: 'freezer_01', clientId: 'client_a' },
      { id: 'freezer_02', clientId: 'client_b' },
    ];
    const logs = [
      {
        deviceId: 'freezer_01',
        temperature: -12.3,
        createdAt: new Date('2026-03-06T10:00:00.000Z'),
      },
      {
        deviceId: 'freezer_01',
        temperature: -11.7,
        createdAt: new Date('2026-03-06T10:05:00.000Z'),
      },
    ];

    const fakePrisma = {
      device: {
        findUnique: jest.fn(({ where }: any) =>
          Promise.resolve(devices.find((d) => d.id === where.id) ?? null),
        ),
      },
      temperatureLog: {
        findMany: jest.fn((args: any = {}) => {
          let rows = logs.filter((r) => r.deviceId === args.where?.deviceId);
          if (args.orderBy?.createdAt === 'desc') {
            rows = rows.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
          }
          if (typeof args.take === 'number') rows = rows.slice(0, args.take);
          return Promise.resolve(rows);
        }),
      },
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [ReadingsController],
      providers: [
        ReadingsService,
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

  it('GET /readings/:deviceId should return normalized readings', async () => {
    await request(app.getHttpServer())
      .get('/readings/freezer_01?sensor=temperature&limit=2')
      .expect(200)
      .expect((res) => {
        expect(res.body).toEqual([
          {
            deviceId: 'freezer_01',
            sensorType: 'temperature',
            value: -12.3,
            createdAt: '2026-03-06T10:00:00.000Z',
          },
          {
            deviceId: 'freezer_01',
            sensorType: 'temperature',
            value: -11.7,
            createdAt: '2026-03-06T10:05:00.000Z',
          },
        ]);
      });
  });

  it('GET /readings/:deviceId with matching clientId should return 200', async () => {
    await request(app.getHttpServer())
      .get('/readings/freezer_01?clientId=client_a')
      .expect(200);
  });

  it('GET /readings/:deviceId with wrong clientId should return 404', async () => {
    await request(app.getHttpServer())
      .get('/readings/freezer_01?clientId=client_b')
      .expect(404);
  });

  it('GET /readings/:deviceId with resolution should return aggregated points', async () => {
    await request(app.getHttpServer())
      .get('/readings/freezer_01?resolution=5m')
      .expect(200)
      .expect((res) => {
        expect(res.body[0]).toEqual(
          expect.objectContaining({
            count: expect.any(Number),
            minValue: expect.any(Number),
            maxValue: expect.any(Number),
          }),
        );
      });
  });
});
