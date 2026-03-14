import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppController } from './../src/app.controller';
import { AppService } from './../src/app.service';
import { AlertDeliveryQueueService } from './../src/infra/alerts/alert-delivery-queue.service';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;
  let fakeConfigService: { get: jest.Mock };
  let fakeAlertQueue: { getQueueDepth: jest.Mock };

  beforeEach(async () => {
    fakeConfigService = {
      get: jest.fn((key: string) => {
        if (key === 'NODE_ENV') return 'test';
        if (key === 'APP_RELEASE') return 'test-release';
        if (key === 'APP_BUILD_TIME') return '2026-03-14T00:00:00.000Z';
        return undefined;
      }),
    };
    fakeAlertQueue = {
      getQueueDepth: jest.fn().mockReturnValue(0),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        { provide: ConfigService, useValue: fakeConfigService },
        { provide: AlertDeliveryQueueService, useValue: fakeAlertQueue },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  it('/health (GET)', () => {
    return request(app.getHttpServer())
      .get('/health')
      .expect(200)
      .expect((res) => {
        expect(res.body).toEqual(
          expect.objectContaining({
            status: 'ok',
            timestamp: expect.any(String),
            environment: 'test',
            release: 'test-release',
            buildTime: '2026-03-14T00:00:00.000Z',
            alertQueueDepth: 0,
            features: expect.objectContaining({
              authLogin: true,
              authMe: true,
              clientCommercialProfile: true,
              actuationCommandsRecent: true,
              operationalActivityPanel: true,
            }),
          }),
        );
      });
  });
});
