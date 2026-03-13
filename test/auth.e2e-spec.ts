import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import request from 'supertest';
import { AuthController } from '../src/modules/auth/auth.controller';
import { AuthService } from '../src/modules/auth/auth.service';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Auth (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const users = new Map<string, any>();
    const authServiceForSeed = new AuthService(
      {} as PrismaService,
      {
        get: jest.fn((key: string) => {
          if (key === 'AUTH_SECRET') return 'super-secret-auth-key-123';
          if (key === 'AUTH_TOKEN_TTL_HOURS') return 24;
          return undefined;
        }),
      } as any,
    );

    const passwordHash = authServiceForSeed.hashPassword('secret123');
    users.set('operator@virtuagil.com.br', {
      id: 'user_1',
      clientId: 'virtuagil',
      name: 'Operador Virtuagil',
      email: 'operator@virtuagil.com.br',
      passwordHash,
      role: 'operator',
      phone: null,
      isActive: true,
      lastLoginAt: null,
      createdAt: new Date('2026-03-13T00:00:00.000Z'),
      updatedAt: new Date('2026-03-13T00:00:00.000Z'),
    });

    const fakePrisma = {
      user: {
        findUnique: jest.fn(({ where }: any) => {
          if (where.email) return Promise.resolve(users.get(where.email) ?? null);
          const found =
            Array.from(users.values()).find((row) => row.id === where.id) ?? null;
          return Promise.resolve(found);
        }),
        update: jest.fn(({ where, data }: any) => {
          const current =
            Array.from(users.values()).find((row) => row.id === where.id) ?? null;
          if (!current) return Promise.resolve(null);
          const next = { ...current, ...data };
          users.set(next.email, next);
          return Promise.resolve(next);
        }),
      },
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        AuthService,
        { provide: PrismaService, useValue: fakePrisma },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'AUTH_SECRET') return 'super-secret-auth-key-123';
              if (key === 'AUTH_TOKEN_TTL_HOURS') return 24;
              return undefined;
            }),
          },
        },
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

  it('POST /auth/login should return token and user', async () => {
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'operator@virtuagil.com.br',
        password: 'secret123',
      })
      .expect(201)
      .expect((res) => {
        expect(res.body).toEqual(
          expect.objectContaining({
            token: expect.any(String),
            user: expect.objectContaining({
              email: 'operator@virtuagil.com.br',
              clientId: 'virtuagil',
            }),
          }),
        );
      });
  });

  it('POST /auth/login should reject invalid password', async () => {
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'operator@virtuagil.com.br',
        password: 'wrong-password',
      })
      .expect(401);
  });

  it('GET /auth/me should return current user from bearer token', async () => {
    const login = await request(app.getHttpServer()).post('/auth/login').send({
      email: 'operator@virtuagil.com.br',
      password: 'secret123',
    });

    await request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', `Bearer ${login.body.token}`)
      .expect(200)
      .expect((res) => {
        expect(res.body).toEqual(
          expect.objectContaining({
            email: 'operator@virtuagil.com.br',
            name: 'Operador Virtuagil',
          }),
        );
      });
  });
});
