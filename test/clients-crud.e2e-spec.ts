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
          const row = {
            status: 'active',
            document: null,
            adminName: null,
            phone: null,
            adminPhone: null,
            billingName: null,
            billingPhone: null,
            billingEmail: null,
            notes: null,
            ...data,
            createdAt: new Date('2026-03-07T00:00:00.000Z'),
            updatedAt: new Date('2026-03-07T00:00:00.000Z'),
          };
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
        findFirst: jest.fn(({ where }: any) =>
          Promise.resolve(
            Array.from(clients.values()).find((client) => {
              if (where.document && where.id?.not) {
                return client.document === where.document && client.id !== where.id.not;
              }
              if (where.document) return client.document === where.document;
              return false;
            }) ?? null,
          ),
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
      .send({
        id: 'client_a',
        name: 'Client A',
        adminName: 'Admin Client A',
        alertContactName: 'Operacao Client A',
        document: '11222333000181',
        adminPhone: '31999998888',
        alertPhone: '31999997777',
        billingName: 'Financeiro Client A',
        billingPhone: '3133334444',
        billingEmail: 'financeiro@clientea.com',
        status: 'active',
      })
      .expect(201);

    await request(app.getHttpServer())
      .get('/clients')
      .expect(200)
      .expect((res) => {
        expect(res.body).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              id: 'client_a',
              name: 'Client A',
              adminName: 'Admin Client A',
              alertContactName: 'Operacao Client A',
              document: '11222333000181',
              adminPhone: '5531999998888',
              alertPhone: '5531999997777',
              billingName: 'Financeiro Client A',
              billingPhone: '553133334444',
              billingEmail: 'financeiro@clientea.com',
              status: 'active',
            }),
          ]),
        );
      });

    await request(app.getHttpServer())
      .patch('/clients/client_a')
      .send({
        name: 'Client A Updated',
        adminName: 'Admin Atualizado',
        alertContactName: 'Operacao Atualizada',
        adminPhone: '31988887777',
        alertPhone: '31977776666',
        billingName: 'Financeiro Atualizado',
        billingPhone: '3132221111',
        status: 'delinquent',
      })
      .expect(200)
      .expect((res) => {
        expect(res.body).toEqual(
            expect.objectContaining({
              id: 'client_a',
              name: 'Client A Updated',
              adminName: 'Admin Atualizado',
              alertContactName: 'Operacao Atualizada',
              adminPhone: '5531988887777',
              alertPhone: '5531977776666',
              billingName: 'Financeiro Atualizado',
              billingPhone: '553132221111',
              status: 'delinquent',
            }),
        );
      });

    await request(app.getHttpServer()).delete('/clients/client_a').expect(200);

    await request(app.getHttpServer()).get('/clients/client_a').expect(404);
  });

  it('should reject duplicated client document', async () => {
    await request(app.getHttpServer())
      .post('/clients')
      .send({
        id: 'client_a',
        name: 'Client A',
        adminName: 'Admin Client A',
        alertContactName: 'Operacao Client A',
        document: '11.222.333/0001-81',
        adminPhone: '31999998888',
        alertPhone: '31999997777',
        billingName: 'Financeiro Client A',
        billingPhone: '3133334444',
        billingEmail: 'financeiro@clientea.com',
        status: 'active',
      })
      .expect(201);

    await request(app.getHttpServer())
      .post('/clients')
      .send({
        id: 'client_b',
        name: 'Client B',
        adminName: 'Admin Client B',
        alertContactName: 'Operacao Client B',
        document: '11222333000181',
        adminPhone: '31999990000',
        alertPhone: '31999991111',
        billingName: 'Financeiro Client B',
        billingPhone: '3133330000',
        billingEmail: 'financeiro@clienteb.com',
        status: 'active',
      })
      .expect(409);
  });
});
