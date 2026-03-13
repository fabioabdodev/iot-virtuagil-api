import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { ClientsController } from '../src/modules/clients/clients.controller';
import { ClientsService } from '../src/modules/clients/clients.service';
import { PrismaService } from '../src/prisma/prisma.service';
import { RoleGuard, SessionAuthGuard } from '../src/modules/auth/auth.guards';

describe('Clients CRUD (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const clients = new Map<string, any>();

    const fakePrisma = {
      client: {
        create: jest.fn(({ data }: any) => {
          const row = { ...data, createdAt: new Date('2026-03-07T00:00:00.000Z') };
          clients.set(data.id, row);
          return Promise.resolve(row);
        }),
        findMany: jest.fn(() =>
          Promise.resolve(
            Array.from(clients.values()).sort((a, b) => a.id.localeCompare(b.id)),
          ),
        ),
        findUnique: jest.fn(({ where }: any) =>
          Promise.resolve(clients.get(where.id) ?? null),
        ),
        update: jest.fn(({ where, data }: any) => {
          const current = clients.get(where.id);
          const updated = { ...current, ...data };
          clients.set(where.id, updated);
          return Promise.resolve(updated);
        }),
        delete: jest.fn(({ where }: any) => {
          const row = clients.get(where.id);
          clients.delete(where.id);
          return Promise.resolve(row);
        }),
      },
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [ClientsController],
      providers: [
        ClientsService,
        { provide: PrismaService, useValue: fakePrisma },
      ],
    })
      .overrideGuard(SessionAuthGuard)
      .useValue({
        canActivate: (context: any) => {
          context.switchToHttp().getRequest().authUser = {
            id: 'platform_admin',
            clientId: null,
            name: 'Platform Admin',
            email: 'platform@virtuagil.com.br',
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

  it('should create, list, update and delete client', async () => {
    await request(app.getHttpServer())
      .post('/clients')
      .send({ id: 'client_a', name: 'Client A' })
      .expect(201);

    await request(app.getHttpServer())
      .get('/clients')
      .expect(200)
      .expect((res) => {
        expect(res.body).toEqual(
          expect.arrayContaining([
            expect.objectContaining({ id: 'client_a', name: 'Client A' }),
          ]),
        );
      });

    await request(app.getHttpServer())
      .patch('/clients/client_a')
      .send({ name: 'Client A Updated' })
      .expect(200)
      .expect((res) => {
        expect(res.body).toEqual(
          expect.objectContaining({ id: 'client_a', name: 'Client A Updated' }),
        );
      });

    await request(app.getHttpServer()).delete('/clients/client_a').expect(200);

    await request(app.getHttpServer()).get('/clients/client_a').expect(404);
  });
});
