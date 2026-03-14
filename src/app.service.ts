import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AlertDeliveryQueueService } from './infra/alerts/alert-delivery-queue.service';

@Injectable()
export class AppService {
  constructor(
    private readonly configService: ConfigService,
    private readonly alertQueue: AlertDeliveryQueueService,
  ) {}

  getHello(): string {
    return 'Hello World!';
  }

  getHealth() {
    const appRelease = this.configService.get<string>('APP_RELEASE') ?? 'local';
    const appBuildTime = this.configService.get<string>('APP_BUILD_TIME') ?? null;

    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.round(process.uptime()),
      environment: this.configService.get<string>('NODE_ENV') ?? 'development',
      release: appRelease,
      buildTime: appBuildTime,
      alertQueueDepth: this.alertQueue.getQueueDepth(),
      features: {
        authLogin: true,
        authMe: true,
        clientCommercialProfile: true,
        actuationCommandsRecent: true,
        operationalActivityPanel: true,
      },
    };
  }
}
