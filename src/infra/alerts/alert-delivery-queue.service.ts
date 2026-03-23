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

type EnergyAlertPayload = {
  type: 'energy_out_of_range';
  clientId: string | null;
  ruleId: string | null;
  deviceId: string;
  sensorType: 'corrente' | 'tensao' | 'consumo';
  value: number;
  unit: string | null;
  minValue: number | null;
  maxValue: number | null;
  occurredAt: string;
};

type OfflineAlertPayload = {
  type: 'device_offline';
  clientId: string | null;
  deviceId: string;
  lastSeenAt: string | null;
  offlineSince: string;
};

type OnlineAlertPayload = {
  type: 'device_back_online';
  clientId: string | null;
  deviceId: string;
  lastSeenAt: string | null;
  offlineSince: string | null;
  cameOnlineAt: string;
};

type ConnectivityInstabilityPayload = {
  type: 'device_connectivity_instability';
  clientId: string | null;
  deviceId: string;
  offlineSince: string | null;
  cameOnlineAt: string;
  flapCount: number;
  windowMinutes: number;
};

type AlertPayload =
  | TemperatureAlertPayload
  | EnergyAlertPayload
  | OfflineAlertPayload
  | OnlineAlertPayload
  | ConnectivityInstabilityPayload;

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
    if (type === 'energy_out_of_range') {
      return this.configService.get<string>('N8N_ENERGY_ALERT_WEBHOOK_URL');
    }

    if (type === 'device_offline') {
      return this.configService.get<string>('N8N_OFFLINE_WEBHOOK_URL');
    }

    if (type === 'device_back_online') {
      return this.configService.get<string>('N8N_ONLINE_WEBHOOK_URL');
    }

    if (type === 'device_connectivity_instability') {
      return this.configService.get<string>('N8N_ONLINE_WEBHOOK_URL');
    }

    return this.configService.get<string>('N8N_TEMPERATURE_ALERT_WEBHOOK_URL');
  }

  private async mapPayloadToWebhookBody(payload: AlertPayload) {
    const context = await this.resolveAlertContext(
      payload.clientId,
      payload.deviceId,
    );
    const timezone =
      this.configService.get<string>('ALERTS_TIMEZONE') ?? 'America/Sao_Paulo';

    if (payload.type === 'device_offline') {
      const offlineSinceLocal = this.toLocalDateTime(payload.offlineSince, timezone);
      const lastSeenLocal = this.toLocalDateTime(payload.lastSeenAt, timezone);
      return {
        type: payload.type,
        client_id: payload.clientId,
        clientId: payload.clientId,
        client_name: context.clientName,
        clientName: context.clientName,
        client_document: context.clientDocument,
        clientDocument: context.clientDocument,
        device_id: payload.deviceId,
        deviceId: payload.deviceId,
        device_name: context.deviceName,
        deviceName: context.deviceName,
        device_location: context.deviceLocation,
        deviceLocation: context.deviceLocation,
        establishment_label: context.establishmentLabel,
        establishmentLabel: context.establishmentLabel,
        last_seen_at: payload.lastSeenAt,
        lastSeenAt: payload.lastSeenAt,
        last_seen_local: lastSeenLocal,
        lastSeenLocal,
        offline_since: payload.offlineSince,
        offlineSince: payload.offlineSince,
        offline_since_local: offlineSinceLocal,
        offlineSinceLocal: offlineSinceLocal,
        recipient_phone: context.recipientPhone,
        recipientPhone: context.recipientPhone,
        recipient_source: context.recipientSource,
        recipientSource: context.recipientSource,
      };
    }

    if (payload.type === 'device_back_online') {
      const recoveredOfflineSince = payload.offlineSince ?? payload.lastSeenAt;
      const offlineSinceLocal = this.toLocalDateTime(recoveredOfflineSince, timezone);
      const cameOnlineLocal = this.toLocalDateTime(payload.cameOnlineAt, timezone);
      const lastSeenLocal = this.toLocalDateTime(payload.lastSeenAt, timezone);
      return {
        type: payload.type,
        event_type_alias: 'device_online',
        client_id: payload.clientId,
        clientId: payload.clientId,
        client_name: context.clientName,
        clientName: context.clientName,
        client_document: context.clientDocument,
        clientDocument: context.clientDocument,
        device_id: payload.deviceId,
        deviceId: payload.deviceId,
        device_name: context.deviceName,
        deviceName: context.deviceName,
        device_location: context.deviceLocation,
        deviceLocation: context.deviceLocation,
        establishment_label: context.establishmentLabel,
        establishmentLabel: context.establishmentLabel,
        last_seen_at: payload.lastSeenAt,
        lastSeenAt: payload.lastSeenAt,
        last_seen_local: lastSeenLocal,
        lastSeenLocal,
        offline_since: recoveredOfflineSince,
        offlineSince: recoveredOfflineSince,
        offline_since_source: payload.offlineSince
          ? 'offline_since'
          : payload.lastSeenAt
            ? 'last_seen_at_fallback'
            : null,
        offline_since_local: offlineSinceLocal,
        offlineSinceLocal: offlineSinceLocal,
        came_online_at: payload.cameOnlineAt,
        cameOnlineAt: payload.cameOnlineAt,
        came_online_local: cameOnlineLocal,
        cameOnlineLocal,
        recipient_phone: context.recipientPhone,
        recipientPhone: context.recipientPhone,
        recipient_source: context.recipientSource,
        recipientSource: context.recipientSource,
      };
    }

    if (payload.type === 'device_connectivity_instability') {
      const offlineSinceLocal = this.toLocalDateTime(payload.offlineSince, timezone);
      const cameOnlineLocal = this.toLocalDateTime(payload.cameOnlineAt, timezone);
      return {
        type: payload.type,
        client_id: payload.clientId,
        clientId: payload.clientId,
        client_name: context.clientName,
        clientName: context.clientName,
        client_document: context.clientDocument,
        clientDocument: context.clientDocument,
        device_id: payload.deviceId,
        deviceId: payload.deviceId,
        device_name: context.deviceName,
        deviceName: context.deviceName,
        device_location: context.deviceLocation,
        deviceLocation: context.deviceLocation,
        establishment_label: context.establishmentLabel,
        establishmentLabel: context.establishmentLabel,
        offline_since: payload.offlineSince,
        offlineSince: payload.offlineSince,
        offline_since_local: offlineSinceLocal,
        offlineSinceLocal: offlineSinceLocal,
        came_online_at: payload.cameOnlineAt,
        cameOnlineAt: payload.cameOnlineAt,
        came_online_local: cameOnlineLocal,
        cameOnlineLocal,
        flap_count: payload.flapCount,
        flapCount: payload.flapCount,
        window_minutes: payload.windowMinutes,
        windowMinutes: payload.windowMinutes,
        recipient_phone: context.recipientPhone,
        recipientPhone: context.recipientPhone,
        recipient_source: context.recipientSource,
        recipientSource: context.recipientSource,
      };
    }

    if (payload.type === 'energy_out_of_range') {
      const occurredAtLocal = this.toLocalDateTime(payload.occurredAt, timezone);
      return {
        type: payload.type,
        client_id: payload.clientId,
        clientId: payload.clientId,
        client_name: context.clientName,
        clientName: context.clientName,
        client_document: context.clientDocument,
        clientDocument: context.clientDocument,
        rule_id: payload.ruleId,
        ruleId: payload.ruleId,
        device_id: payload.deviceId,
        deviceId: payload.deviceId,
        device_name: context.deviceName,
        deviceName: context.deviceName,
        device_location: context.deviceLocation,
        deviceLocation: context.deviceLocation,
        establishment_label: context.establishmentLabel,
        establishmentLabel: context.establishmentLabel,
        sensor_type: payload.sensorType,
        sensorType: payload.sensorType,
        value: payload.value,
        unit: payload.unit,
        min_value: payload.minValue,
        minValue: payload.minValue,
        max_value: payload.maxValue,
        maxValue: payload.maxValue,
        occurred_at: payload.occurredAt,
        occurredAt: payload.occurredAt,
        occurred_at_local: occurredAtLocal,
        occurredAtLocal,
        recipient_phone: context.recipientPhone,
        recipientPhone: context.recipientPhone,
        recipient_source: context.recipientSource,
        recipientSource: context.recipientSource,
      };
    }

    const occurredAtLocal = this.toLocalDateTime(payload.occurredAt, timezone);
    return {
      type: payload.type,
      client_id: payload.clientId,
      clientId: payload.clientId,
      client_name: context.clientName,
      clientName: context.clientName,
      client_document: context.clientDocument,
      clientDocument: context.clientDocument,
      rule_id: payload.ruleId,
      ruleId: payload.ruleId,
      device_id: payload.deviceId,
      deviceId: payload.deviceId,
      device_name: context.deviceName,
      deviceName: context.deviceName,
      device_location: context.deviceLocation,
      deviceLocation: context.deviceLocation,
      establishment_label: context.establishmentLabel,
      establishmentLabel: context.establishmentLabel,
      temperature: payload.temperature,
      min_temperature: payload.minTemperature,
      minTemperature: payload.minTemperature,
      max_temperature: payload.maxTemperature,
      maxTemperature: payload.maxTemperature,
      occurred_at: payload.occurredAt,
      occurredAt: payload.occurredAt,
      occurred_at_local: occurredAtLocal,
      occurredAtLocal,
      recipient_phone: context.recipientPhone,
      recipientPhone: context.recipientPhone,
      recipient_source: context.recipientSource,
      recipientSource: context.recipientSource,
    };
  }

  private async resolveAlertContext(clientId: string | null, deviceId: string) {
    const client = clientId
      ? await this.prisma.client.findUnique({
      where: { id: clientId },
      select: {
        id: true,
        name: true,
        document: true,
        alertPhone: true,
        adminPhone: true,
        phone: true,
      },
    } as any)
      : null;
    const device = await this.prisma.device.findUnique({
      where: { id: deviceId },
      select: {
        id: true,
        name: true,
        location: true,
      },
    } as any);

    const recipientPhone = client?.alertPhone ?? client?.adminPhone ?? client?.phone ?? null;
    const recipientSource = client?.alertPhone
      ? 'alert_phone'
      : client?.adminPhone
        ? 'admin_phone'
        : client?.phone
          ? 'client_phone'
          : null;
    const establishmentLabel =
      device?.location ?? device?.name ?? device?.id ?? deviceId;

    return {
      recipientPhone,
      recipientSource,
      clientName: client?.name ?? null,
      clientDocument: client?.document ?? null,
      deviceName: device?.name ?? null,
      deviceLocation: device?.location ?? null,
      establishmentLabel,
    };
  }

  private toLocalDateTime(value: string | null, timeZone: string) {
    if (!value) return null;

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return null;

    return parsed.toLocaleString('pt-BR', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  }
}
