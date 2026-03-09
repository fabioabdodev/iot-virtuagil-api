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
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.round(process.uptime()),
      environment: this.configService.get<string>('NODE_ENV') ?? 'development',
      alertQueueDepth: this.alertQueue.getQueueDepth(),
    };
  }
}
