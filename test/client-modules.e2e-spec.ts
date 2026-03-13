import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { PrismaService } from '../src/prisma/prisma.service';
import { ClientModulesController } from '../src/modules/client-modules/client-modules.controller';
import { ClientModulesService } from '../src/modules/client-modules/client-modules.service';
import { RoleGuard, SessionAuthGuard } from '../src/modules/auth/auth.guards';

describe('Client Modules (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const clients = new Map<string, any>([['virtuagil', { id: 'virtuagil', name: 'Virtuagil' }]]);
    const modules = new Map<string, any>();

    const fakePrisma = {
      client: {
        findUnique: jest.fn(({ where }: any) =>
          Promise.resolve(clients.get(where.id) ?? null),
        ),
      },
      clientModule: {
        findMany: jest.fn(({ where }: any) => {
          const rows = Array.from(modules.values()).filter(
            (row) => row.clientId === where.clientId,
          );
          rows.sort((a, b) => a.moduleKey.localeCompare(b.moduleKey));
          return Promise.resolve(rows);
        }),
        upsert: jest.fn(({ where, update, create }: any) => {
          const key = `${where.clientId_moduleKey.clientId}:${where.clientId_moduleKey.moduleKey}`;
          const current = modules.get(key);
          const row =
            current != null
              ? { ...current, ...update, updatedAt: new Date('2026-03-13T02:00:00.000Z') }
              : {
                  id: `module_${modules.size + 1}`,
                  createdAt: new Date('2026-03-13T01:00:00.000Z'),
                  updatedAt: new Date('2026-03-13T01:00:00.000Z'),
                  ...create,
                };
          modules.set(key, row);
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
          context.switchToHttp().getRequest().authUser = {
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
    await request(app.getHttpServer())
      .post('/client-modules')
      .send({
        clientId: 'virtuagil',
        moduleKey: 'temperature',
        enabled: true,
      })
      .expect(201);

    await request(app.getHttpServer())
      .post('/client-modules')
      .send({
        clientId: 'virtuagil',
        moduleKey: 'actuation',
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
              moduleKey: 'temperature',
              enabled: true,
            }),
            expect.objectContaining({
              clientId: 'virtuagil',
              moduleKey: 'actuation',
              enabled: false,
            }),
          ]),
        );
      });
  });
});
