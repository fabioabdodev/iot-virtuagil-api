import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';

type TemperatureAlertPayload = {
  type: 'temperature_out_of_range';
  clientId: string | null;
  ruleId: string | null;
  deviceId: string;
  temperature: number;
  minTemperature: number | null;
  maxTemperature: number | null;
  occurredAt: string;
};

type OfflineAlertPayload = {
  type: 'device_offline';
  clientId: string | null;
  deviceId: string;
  lastSeenAt: string | null;
  offlineSince: string;
};

type AlertPayload = TemperatureAlertPayload | OfflineAlertPayload;

type QueueJob = {
  payload: AlertPayload;
  attempts: number;
  nextAttemptAt: number;
};

@Injectable()
export class AlertDeliveryQueueService implements OnModuleDestroy {
  private readonly logger = new Logger(AlertDeliveryQueueService.name);
  private readonly jobs: QueueJob[] = [];
  private timer: NodeJS.Timeout | null = null;
  private processing = false;

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    this.startWorker();
  }

  enqueue(payload: AlertPayload) {
    this.jobs.push({
      payload,
      attempts: 0,
      nextAttemptAt: Date.now(),
    });

    this.logger.log(
      `Queued alert device=${payload.deviceId} queueDepth=${this.jobs.length}`,
    );
  }

  getQueueDepth() {
    return this.jobs.length;
  }

  onModuleDestroy() {
    if (this.timer) clearInterval(this.timer);
  }

  private startWorker() {
    this.timer = setInterval(() => {
      void this.processPendingJobs();
    }, 1000);
    // Avoid keeping process alive only because of queue timer in tests/dev shutdown.
    this.timer.unref();
  }

  private async processPendingJobs() {
    if (this.processing) return;

    this.processing = true;
    try {
      const now = Date.now();
      const batchSize =
        this.configService.get<number>('ALERT_QUEUE_BATCH_SIZE') ?? 20;
      const dueJobs = this.jobs
        .filter((job) => job.nextAttemptAt <= now)
        .slice(0, batchSize);

      for (const job of dueJobs) {
        await this.processJob(job);
      }
    } finally {
      this.processing = false;
    }
  }

  private async processJob(job: QueueJob) {
    const webhookUrl = this.getWebhookUrl(job.payload.type);
    if (!webhookUrl) {
      this.removeJob(job);
      return;
    }

    try {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(await this.mapPayloadToWebhookBody(job.payload)),
      });
      this.logger.log(
        `Delivered alert device=${job.payload.deviceId} attempts=${job.attempts + 1}`,
      );
      this.removeJob(job);
    } catch (error) {
      job.attempts += 1;

      const maxRetries =
        this.configService.get<number>('ALERT_QUEUE_RETRY_MAX') ?? 3;
      if (job.attempts > maxRetries) {
        this.logger.error(
          `Dropping alert job after retries for device ${job.payload.deviceId}`,
          error instanceof Error ? error.message : String(error),
        );
        this.removeJob(job);
        return;
      }

      const retryDelayMs =
        this.configService.get<number>('ALERT_QUEUE_RETRY_DELAY_MS') ?? 2000;
      job.nextAttemptAt = Date.now() + retryDelayMs;
      this.logger.warn(
        `Retrying alert device=${job.payload.deviceId} attempt=${job.attempts} nextAttemptAt=${new Date(job.nextAttemptAt).toISOString()}`,
      );
    }
  }

  private removeJob(job: QueueJob) {
    const idx = this.jobs.indexOf(job);
    if (idx >= 0) this.jobs.splice(idx, 1);
  }

  private getWebhookUrl(type: AlertPayload['type']) {
    if (type === 'device_offline') {
      return this.configService.get<string>('N8N_OFFLINE_WEBHOOK_URL');
    }

    return this.configService.get<string>('N8N_TEMPERATURE_ALERT_WEBHOOK_URL');
  }

  private async mapPayloadToWebhookBody(payload: AlertPayload) {
    const recipient = await this.resolveRecipient(payload.clientId);

    if (payload.type === 'device_offline') {
      return {
        type: payload.type,
        client_id: payload.clientId,
        device_id: payload.deviceId,
        last_seen_at: payload.lastSeenAt,
        offline_since: payload.offlineSince,
        recipient_phone: recipient?.phone ?? null,
        recipient_source: recipient?.source ?? null,
      };
    }

    return {
      type: payload.type,
      client_id: payload.clientId,
      rule_id: payload.ruleId,
      device_id: payload.deviceId,
      temperature: payload.temperature,
      min_temperature: payload.minTemperature,
      max_temperature: payload.maxTemperature,
      occurred_at: payload.occurredAt,
      recipient_phone: recipient?.phone ?? null,
      recipient_source: recipient?.source ?? null,
    };
  }

  private async resolveRecipient(clientId: string | null) {
    if (!clientId) return null;

    const client = await this.prisma.client.findUnique({
      where: { id: clientId },
      select: {
        alertPhone: true,
        adminPhone: true,
        phone: true,
      },
    } as any);

    if (!client) return null;

    if (client.alertPhone) {
      return { phone: client.alertPhone, source: 'alert_phone' as const };
    }

    if (client.adminPhone) {
      return { phone: client.adminPhone, source: 'admin_phone' as const };
    }

    if (client.phone) {
      return { phone: client.phone, source: 'client_phone' as const };
    }

    return null;
  }
}
