import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { ActuatorsController } from '../src/modules/actuators/actuators.controller';
import { ActuatorsService } from '../src/modules/actuators/actuators.service';
import { PrismaService } from '../src/prisma/prisma.service';
import { ModuleAccessGuard, SessionAuthGuard } from '../src/modules/auth/auth.guards';

describe('Actuators (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const clients = new Map<string, any>();
    const devices = new Map<string, any>();
    const actuators = new Map<string, any>();
    const commands: Array<any> = [];

    clients.set('client_a', { id: 'client_a', name: 'Client A' });
    devices.set('device_a', { id: 'device_a', clientId: 'client_a' });

    const fakePrisma = {
      client: {
        findUnique: jest.fn(({ where }: any) =>
          Promise.resolve(clients.get(where.id) ?? null),
        ),
      },
      device: {
        findUnique: jest.fn(({ where }: any) =>
          Promise.resolve(devices.get(where.id) ?? null),
        ),
      },
      actuator: {
        create: jest.fn(({ data }: any) => {
          const row = {
            ...data,
            location: data.location ?? null,
            deviceId: data.deviceId ?? null,
            lastCommandAt: null,
            lastCommandBy: null,
            createdAt: new Date('2026-03-13T00:00:00.000Z'),
            updatedAt: new Date('2026-03-13T00:00:00.000Z'),
          };
          actuators.set(data.id, row);
          return Promise.resolve(row);
        }),
        findMany: jest.fn(({ where }: any = {}) => {
          let rows = Array.from(actuators.values());
          if (where?.clientId) rows = rows.filter((row) => row.clientId === where.clientId);
          if (where?.deviceId) rows = rows.filter((row) => row.deviceId === where.deviceId);
          if (where?.currentState) {
            rows = rows.filter((row) => row.currentState === where.currentState);
          }
          rows.sort((a, b) => a.id.localeCompare(b.id));
          return Promise.resolve(rows);
        }),
        findUnique: jest.fn(({ where }: any) =>
          Promise.resolve(actuators.get(where.id) ?? null),
        ),
        update: jest.fn(({ where, data }: any) => {
          const current = actuators.get(where.id);
          const updated = {
            ...current,
            ...data,
            updatedAt: new Date('2026-03-13T00:10:00.000Z'),
          };
          actuators.set(where.id, updated);
          return Promise.resolve(updated);
        }),
        delete: jest.fn(({ where }: any) => {
          const row = actuators.get(where.id);
          actuators.delete(where.id);
          return Promise.resolve(row);
        }),
      },
      actuationCommand: {
        create: jest.fn(({ data }: any) => {
          const row = {
            id: `cmd_${commands.length + 1}`,
            ...data,
          };
          commands.unshift(row);
          return Promise.resolve(row);
        }),
        findMany: jest.fn(({ where, take }: any) => {
          const rows = commands
            .filter((row) => row.actuatorId === where.actuatorId)
            .slice(0, take);
          return Promise.resolve(rows);
        }),
      },
      clientModule: {
        findUnique: jest.fn(() =>
          Promise.resolve({ enabled: true }),
        ),
      },
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [ActuatorsController],
      providers: [
        ActuatorsService,
        { provide: PrismaService, useValue: fakePrisma },
      ],
    })
      .overrideGuard(SessionAuthGuard)
      .useValue({
        canActivate: (context: any) => {
          context.switchToHttp().getRequest().authUser = {
            id: 'user_admin',
            clientId: 'client_a',
            name: 'Admin Client A',
            email: 'admin@clienta.com.br',
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

  it('should create actuator and issue command with history', async () => {
    await request(app.getHttpServer())
      .post('/actuators')
      .send({
        id: 'sauna_main',
        clientId: 'client_a',
        deviceId: 'device_a',
        name: 'Sauna principal',
        location: 'Area molhada',
      })
      .expect(201)
      .expect((res) => {
        expect(res.body).toEqual(
          expect.objectContaining({
            id: 'sauna_main',
            currentState: 'off',
          }),
        );
      });

    await request(app.getHttpServer())
      .post('/actuators/sauna_main/commands')
      .send({
        desiredState: 'on',
        source: 'dashboard',
        note: 'Pre-aquecimento',
      })
      .expect(201)
      .expect((res) => {
        expect(res.body).toEqual(
          expect.objectContaining({
            desiredState: 'on',
            actuator: expect.objectContaining({
              id: 'sauna_main',
              currentState: 'on',
              lastCommandBy: 'dashboard',
            }),
          }),
        );
      });

    await request(app.getHttpServer())
      .get('/actuators/sauna_main/commands')
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveLength(1);
        expect(res.body[0]).toEqual(
          expect.objectContaining({
            actuatorId: 'sauna_main',
            desiredState: 'on',
            source: 'dashboard',
          }),
        );
      });
  });

  it('should reject actuator creation when device belongs to another client', async () => {
    await request(app.getHttpServer())
      .post('/actuators')
      .send({
        id: 'sauna_main',
        clientId: 'client_a',
        deviceId: 'missing_device',
        name: 'Sauna principal',
      })
      .expect(400);
  });

  it('should update actuator fields', async () => {
    await request(app.getHttpServer())
      .post('/actuators')
      .send({
        id: 'sauna_main',
        clientId: 'client_a',
        deviceId: 'device_a',
        name: 'Sauna principal',
        location: 'Area molhada',
      })
      .expect(201);

    await request(app.getHttpServer())
      .patch('/actuators/sauna_main')
      .send({
        name: 'Sauna premium',
        location: 'Spa interno',
      })
      .expect(200)
      .expect((res) => {
        expect(res.body).toEqual(
          expect.objectContaining({
            id: 'sauna_main',
            name: 'Sauna premium',
            location: 'Spa interno',
          }),
        );
      });
  });

  it('should delete actuator and return 404 afterwards', async () => {
    await request(app.getHttpServer())
      .post('/actuators')
      .send({
        id: 'sauna_main',
        clientId: 'client_a',
        name: 'Sauna principal',
      })
      .expect(201);

    await request(app.getHttpServer())
      .delete('/actuators/sauna_main')
      .expect(200)
      .expect((res) => {
        expect(res.body).toEqual(
          expect.objectContaining({
            id: 'sauna_main',
          }),
        );
      });

    await request(app.getHttpServer())
      .get('/actuators/sauna_main')
      .expect(404);
  });
});
