import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../src/prisma/prisma.service';
import { CacheService } from '../src/infra/cache/cache.service';
import { EnergyController } from '../src/modules/energy/energy.controller';
import { EnergyService } from '../src/modules/energy/energy.service';
import { ReadingsService } from '../src/modules/readings/readings.service';
import { ModuleAccessGuard, SessionAuthGuard } from '../src/modules/auth/auth.guards';

describe('Energy (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const now = Date.now();
    const devices = [
      { id: 'freezer_01', clientId: 'client_a' },
      { id: 'freezer_02', clientId: 'client_a' },
      { id: 'freezer_03', clientId: 'client_b' },
    ];

    const rows = [
      {
        deviceId: 'freezer_01',
        sensorType: 'consumo',
        value: 12.4,
        unit: 'kwh',
        createdAt: new Date(now - 30 * 60 * 1000),
      },
      {
        deviceId: 'freezer_02',
        sensorType: 'consumo',
        value: 10.8,
        unit: 'kwh',
        createdAt: new Date(now - 20 * 60 * 1000),
      },
      {
        deviceId: 'freezer_02',
        sensorType: 'corrente',
        value: 3.1,
        unit: 'a',
        createdAt: new Date(now - 10 * 60 * 1000),
      },
      {
        deviceId: 'freezer_01',
        sensorType: 'tensao',
        value: 220,
        unit: 'v',
        createdAt: new Date(now - 5 * 60 * 1000),
      },
    ];

    const fakePrisma = {
      device: {
        findUnique: jest.fn(({ where }: any) =>
          Promise.resolve(devices.find((d) => d.id === where.id) ?? null),
        ),
        findMany: jest.fn(({ where }: any) =>
          Promise.resolve(
            devices
              .filter((d) => d.clientId === where.clientId)
              .map((d) => ({ id: d.id })),
          ),
        ),
      },
      sensorReading: {
        findMany: jest.fn((args: any = {}) => {
          let found = rows.filter((row) => {
            const byDevice = args.where?.deviceId?.in
              ? args.where.deviceId.in.includes(row.deviceId)
              : args.where?.deviceId
                ? row.deviceId === args.where.deviceId
                : true;
            const bySensor = args.where?.sensorType?.in
              ? args.where.sensorType.in.includes(row.sensorType)
              : args.where?.sensorType
                ? row.sensorType === args.where.sensorType
                : true;
            const byDate = args.where?.createdAt?.gte
              ? row.createdAt >= args.where.createdAt.gte
              : true;
            return byDevice && bySensor && byDate;
          });

          if (args.orderBy?.createdAt === 'desc') {
            found = found.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
          }

          if (typeof args.take === 'number') {
            found = found.slice(0, args.take);
          }

          if (args.select?.deviceId && Array.isArray(args.distinct)) {
            const unique = Array.from(new Set(found.map((row) => row.deviceId)));
            return Promise.resolve(unique.map((deviceId) => ({ deviceId })));
          }

          return Promise.resolve(found);
        }),
        findFirst: jest.fn((args: any = {}) => {
          const found = rows
            .filter((row) => {
              const byDevice = args.where?.deviceId?.in
                ? args.where.deviceId.in.includes(row.deviceId)
                : true;
              const bySensor = args.where?.sensorType
                ? row.sensorType === args.where.sensorType
                : true;
              return byDevice && bySensor;
            })
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
          return Promise.resolve(found[0] ?? null);
        }),
      },
      temperatureLog: {
        findMany: jest.fn(() => Promise.resolve([])),
      },
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [EnergyController],
      providers: [
        EnergyService,
        ReadingsService,
        { provide: PrismaService, useValue: fakePrisma },
        { provide: CacheService, useValue: { get: jest.fn(() => null), set: jest.fn() } },
        { provide: ConfigService, useValue: { get: jest.fn(() => 15) } },
      ],
    })
      .overrideGuard(SessionAuthGuard)
      .useValue({
        canActivate: (context: any) => {
          context.switchToHttp().getRequest().authUser = {
            id: 'user_admin',
            clientId: null,
            name: 'Admin Global',
            email: 'admin@virtuagil.com.br',
            role: 'admin',
            isActive: true,
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

  it('GET /energy/readings/:deviceId should return consumption readings', async () => {
    await request(app.getHttpServer())
      .get('/energy/readings/freezer_01?sensor=consumo&clientId=client_a')
      .expect(200)
      .expect((res) => {
        expect(res.body).toEqual([
          expect.objectContaining({
            deviceId: 'freezer_01',
            sensorType: 'consumo',
            value: 12.4,
            unit: 'kwh',
          }),
        ]);
      });
  });

  it('GET /energy/summary should return latest values per energy sensor', async () => {
    await request(app.getHttpServer())
      .get('/energy/summary?clientId=client_a&sensors=consumo,corrente,tensao')
      .expect(200)
      .expect((res) => {
        expect(res.body).toEqual(
          expect.objectContaining({
            clientId: 'client_a',
            deviceCount: 2,
            devicesWithRecentReadings: 2,
            latestBySensor: expect.arrayContaining([
              expect.objectContaining({
                sensorType: 'consumo',
                value: 10.8,
              }),
              expect.objectContaining({
                sensorType: 'corrente',
                value: 3.1,
              }),
              expect.objectContaining({
                sensorType: 'tensao',
                value: 220,
              }),
            ]),
          }),
        );
      });
  });

  it('GET /energy/summary should reject unsupported sensor names', async () => {
    await request(app.getHttpServer())
      .get('/energy/summary?clientId=client_a&sensors=potencia')
      .expect(400);
  });
});
