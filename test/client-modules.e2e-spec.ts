import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { PrismaService } from '../src/prisma/prisma.service';
import { ClientModulesController } from '../src/modules/client-modules/client-modules.controller';
import { ClientModulesService } from '../src/modules/client-modules/client-modules.service';
import { RoleGuard, SessionAuthGuard } from '../src/modules/auth/auth.guards';

describe('Client Modules (e2e)', () => {
  let app: INestApplication;
  let authUser: any;

  beforeEach(async () => {
    authUser = {
      id: 'user_admin',
      clientId: 'virtuagil',
      name: 'Admin Virtuagil',
      email: 'admin@virtuagil.com.br',
      role: 'admin',
      phone: null,
      isActive: true,
      lastLoginAt: null,
      createdAt: new Date('2026-03-13T00:00:00.000Z'),
      updatedAt: new Date('2026-03-13T00:00:00.000Z'),
    };
    const clients = new Map<string, any>([['virtuagil', { id: 'virtuagil', name: 'Virtuagil' }]]);
    const moduleItems = [
      {
        key: 'temperatura',
        moduleKey: 'ambiental',
        name: 'Temperatura',
        description: 'Leitura e alertas de temperatura.',
      },
      {
        key: 'umidade',
        moduleKey: 'ambiental',
        name: 'Umidade',
        description: 'Leitura e alertas de umidade.',
      },
      {
        key: 'rele',
        moduleKey: 'acionamento',
        name: 'Rele',
        description: 'Comando liga/desliga.',
      },
    ];
    const modules = [
      {
        key: 'ambiental',
        name: 'Ambiental',
        description: 'Monitoramento ambiental.',
      },
      {
        key: 'acionamento',
        name: 'Acionamento',
        description: 'Controle de cargas.',
      },
    ];
    const clientModuleItems = new Map<string, any>();
    const legacyModules = new Map<string, any>();

    const fakePrisma = {
      client: {
        findUnique: jest.fn(({ where }: any) =>
          Promise.resolve(clients.get(where.id) ?? null),
        ),
      },
      moduleCatalog: {
        findMany: jest.fn(() =>
          Promise.resolve(
            modules.map((module) => ({
              ...module,
              items: moduleItems.filter((item) => item.moduleKey === module.key),
            })),
          ),
        ),
      },
      moduleCatalogItem: {
        findUnique: jest.fn(({ where }: any) =>
          Promise.resolve(moduleItems.find((item) => item.key === where.key) ?? null),
        ),
        findMany: jest.fn(({ where }: any) =>
          Promise.resolve(
            moduleItems
              .filter((item) => item.moduleKey === where.moduleKey)
              .map((item) => ({ key: item.key })),
          ),
        ),
      },
      clientModuleItem: {
        findMany: jest.fn(({ where }: any) => {
          const rows = Array.from(clientModuleItems.values()).filter(
            (row) => row.clientId === where.clientId,
          );
          rows.sort((a, b) => a.itemKey.localeCompare(b.itemKey));
          return Promise.resolve(rows);
        }),
        upsert: jest.fn(({ where, update, create }: any) => {
          const key = `${where.clientId_itemKey.clientId}:${where.clientId_itemKey.itemKey}`;
          const current = clientModuleItems.get(key);
          const row =
            current != null
              ? { ...current, ...update, updatedAt: new Date('2026-03-13T02:00:00.000Z') }
              : {
                  id: `item_${clientModuleItems.size + 1}`,
                  createdAt: new Date('2026-03-13T01:00:00.000Z'),
                  updatedAt: new Date('2026-03-13T01:00:00.000Z'),
                  ...create,
                };
          clientModuleItems.set(key, row);
          return Promise.resolve(row);
        }),
        count: jest.fn(({ where }: any) => {
          const rows = Array.from(clientModuleItems.values()).filter((row) => {
            if (row.clientId !== where.clientId) return false;
            if (where.enabled != null && row.enabled !== where.enabled) return false;
            if (where.itemKey?.in && !where.itemKey.in.includes(row.itemKey)) return false;
            return true;
          });
          return Promise.resolve(rows.length);
        }),
      },
      clientModule: {
        findMany: jest.fn(({ where }: any) => {
          const rows = Array.from(legacyModules.values()).filter(
            (row) => row.clientId === where.clientId,
          );
          rows.sort((a, b) => a.moduleKey.localeCompare(b.moduleKey));
          return Promise.resolve(rows);
        }),
        upsert: jest.fn(({ where, update, create }: any) => {
          const key = `${where.clientId_moduleKey.clientId}:${where.clientId_moduleKey.moduleKey}`;
          const current = legacyModules.get(key);
          const row =
            current != null
              ? { ...current, ...update, updatedAt: new Date('2026-03-13T02:00:00.000Z') }
              : {
                  id: `module_${legacyModules.size + 1}`,
                  createdAt: new Date('2026-03-13T01:00:00.000Z'),
                  updatedAt: new Date('2026-03-13T01:00:00.000Z'),
                  ...create,
                };
          legacyModules.set(key, row);
          return Promise.resolve(row);
        }),
      },
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [ClientModulesController],
      providers: [
        ClientModulesService,
        { provide: PrismaService, useValue: fakePrisma },
      ],
    })
      .overrideGuard(SessionAuthGuard)
      .useValue({
        canActivate: (context: any) => {
          context.switchToHttp().getRequest().authUser = authUser;
          return true;
        },
      })
      .overrideGuard(RoleGuard)
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

  it('should upsert and list client modules', async () => {
    authUser = {
      ...authUser,
      clientId: null,
      email: 'platform@virtuagil.com.br',
    };

    await request(app.getHttpServer())
      .post('/client-modules')
      .send({
        clientId: 'virtuagil',
        moduleKey: 'ambiental',
        enabled: true,
      })
      .expect(201);

    await request(app.getHttpServer())
      .post('/client-modules')
      .send({
        clientId: 'virtuagil',
        moduleKey: 'acionamento',
        enabled: false,
      })
      .expect(201);

    await request(app.getHttpServer())
      .get('/client-modules?clientId=virtuagil')
      .expect(200)
      .expect((res) => {
        expect(res.body).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              clientId: 'virtuagil',
              moduleKey: 'ambiental',
              enabled: true,
              items: expect.any(Array),
            }),
            expect.objectContaining({
              clientId: 'virtuagil',
              moduleKey: 'acionamento',
              enabled: false,
              items: expect.any(Array),
            }),
          ]),
        );
      });
  });

  it('should allow operator to list modules but not change them', async () => {
    authUser = {
      ...authUser,
      role: 'operator',
      email: 'operator@virtuagil.com.br',
    };

    await request(app.getHttpServer())
      .get('/client-modules?clientId=virtuagil')
      .expect(200);

    await request(app.getHttpServer())
      .post('/client-modules')
      .send({
        clientId: 'virtuagil',
        moduleKey: 'ambiental',
        enabled: true,
      })
      .expect(403);
  });
});
