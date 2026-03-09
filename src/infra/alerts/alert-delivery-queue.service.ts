import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

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

type QueueJob = {
  payload: TemperatureAlertPayload;
  attempts: number;
  nextAttemptAt: number;
};

@Injectable()
export class AlertDeliveryQueueService implements OnModuleDestroy {
  private readonly logger = new Logger(AlertDeliveryQueueService.name);
  private readonly jobs: QueueJob[] = [];
  private timer: NodeJS.Timeout | null = null;
  private processing = false;

  constructor(private readonly configService: ConfigService) {
    this.startWorker();
  }

  enqueue(payload: TemperatureAlertPayload) {
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
    const webhookUrl = this.configService.get<string>(
      'N8N_TEMPERATURE_ALERT_WEBHOOK_URL',
    );
    if (!webhookUrl) {
      this.removeJob(job);
      return;
    }

    try {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: job.payload.type,
          client_id: job.payload.clientId,
          rule_id: job.payload.ruleId,
          device_id: job.payload.deviceId,
          temperature: job.payload.temperature,
          min_temperature: job.payload.minTemperature,
          max_temperature: job.payload.maxTemperature,
          occurred_at: job.payload.occurredAt,
        }),
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
}
