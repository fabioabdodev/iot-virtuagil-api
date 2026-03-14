import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AlertDeliveryQueueService } from './infra/alerts/alert-delivery-queue.service';

describe('AppController', () => {
  let appController: AppController;
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

    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        { provide: ConfigService, useValue: fakeConfigService },
        { provide: AlertDeliveryQueueService, useValue: fakeAlertQueue },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(appController.getHello()).toBe('Hello World!');
    });

    it('should return health payload', () => {
      expect(appController.getHealth()).toEqual(
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
