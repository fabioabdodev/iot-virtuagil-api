import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { PrismaService } from '../src/prisma/prisma.service';
import { UsersController } from '../src/modules/users/users.controller';
import { UsersService } from '../src/modules/users/users.service';
import { AuthService } from '../src/modules/auth/auth.service';
import { ConfigService } from '@nestjs/config';

describe('Users (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const users = new Map<string, any>();
    const clients = new Map<string, any>([['virtuagil', { id: 'virtuagil', name: 'Virtuagil' }]]);

    const fakeConfig = {
      get: jest.fn((key: string) => {
        if (key === 'AUTH_SECRET') return 'super-secret-auth-key-123';
        if (key === 'AUTH_TOKEN_TTL_HOURS') return 24;
        return undefined;
      }),
    };

    const fakePrisma = {
      client: {
        findUnique: jest.fn(({ where }: any) =>
          Promise.resolve(clients.get(where.id) ?? null),
        ),
      },
      user: {
        create: jest.fn(({ data }: any) => {
          const row = {
            id: `user_${users.size + 1}`,
            createdAt: new Date('2026-03-13T00:00:00.000Z'),
            updatedAt: new Date('2026-03-13T00:00:00.000Z'),
            lastLoginAt: null,
            phone: null,
            isActive: true,
            ...data,
          };
          users.set(row.id, row);
          return Promise.resolve(row);
        }),
        findMany: jest.fn(({ where }: any = {}) => {
          let rows = Array.from(users.values());
          if (where?.clientId) rows = rows.filter((row) => row.clientId === where.clientId);
          rows.sort((a, b) => a.name.localeCompare(b.name));
          return Promise.resolve(rows);
        }),
        findUnique: jest.fn(({ where }: any) => {
          if (where.id) {
            return Promise.resolve(users.get(where.id) ?? null);
          }
          return Promise.resolve(
            Array.from(users.values()).find((row) => row.email === where.email) ?? null,
          );
        }),
        update: jest.fn(({ where, data }: any) => {
          const current = users.get(where.id);
          const next = { ...current, ...data, updatedAt: new Date('2026-03-13T01:00:00.000Z') };
          users.set(where.id, next);
          return Promise.resolve(next);
        }),
        delete: jest.fn(({ where }: any) => {
          const current = users.get(where.id);
          users.delete(where.id);
          return Promise.resolve(current);
        }),
      },
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        UsersService,
        AuthService,
        { provide: PrismaService, useValue: fakePrisma },
        { provide: ConfigService, useValue: fakeConfig },
      ],
    }).compile();

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

  it('should create, list, update and delete users', async () => {
    const created = await request(app.getHttpServer())
      .post('/users')
      .send({
        clientId: 'virtuagil',
        name: 'Operador Virtuagil',
        email: 'operator@virtuagil.com.br',
        password: 'operador123',
        role: 'operator',
      })
      .expect(201);

    await request(app.getHttpServer())
      .get('/users?clientId=virtuagil')
      .expect(200)
      .expect((res) => {
        expect(res.body).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              id: created.body.id,
              email: 'operator@virtuagil.com.br',
            }),
          ]),
        );
      });

    await request(app.getHttpServer())
      .patch(`/users/${created.body.id}`)
      .send({
        phone: '31999999999',
        role: 'admin',
      })
      .expect(200)
      .expect((res) => {
        expect(res.body).toEqual(
          expect.objectContaining({
            phone: '31999999999',
            role: 'admin',
          }),
        );
      });

    await request(app.getHttpServer())
      .delete(`/users/${created.body.id}`)
      .expect(200);

    await request(app.getHttpServer()).get(`/users/${created.body.id}`).expect(404);
  });
});
