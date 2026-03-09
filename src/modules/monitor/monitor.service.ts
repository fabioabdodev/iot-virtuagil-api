import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { AlertDeliveryQueueService } from '../../infra/alerts/alert-delivery-queue.service';

@Injectable()
export class MonitorService {
  private readonly logger = new Logger(MonitorService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly alertQueue: AlertDeliveryQueueService,
  ) {}

  @Cron('*/1 * * * *')
  async checkOfflineDevices() {
    const minutesOffline =
      this.configService.get<number>('DEVICE_OFFLINE_MINUTES') ?? 5;
    const temperatureCooldownMinutes =
      this.configService.get<number>('TEMPERATURE_ALERT_COOLDOWN_MINUTES') ?? 5;

    const cutoff = new Date(Date.now() - minutesOffline * 60 * 1000);
    const totalDevices = await this.prisma.device.count();
    const offlineCandidates = await this.prisma.device.findMany({
      where: {
        AND: [
          { isOffline: false },
          {
            OR: [{ lastSeen: null }, { lastSeen: { lt: cutoff } }],
          },
        ],
      },
    });
    this.logger.log(
      `Monitor tick totalDevices=${totalDevices} offlineCandidates=${offlineCandidates.length} cutoff=${cutoff.toISOString()} offlineThresholdMinutes=${minutesOffline}`,
    );

    for (const device of offlineCandidates) {
      await this.prisma.device.update({
        where: { id: device.id },
        data: {
          isOffline: true,
          offlineSince: new Date(Date.now()),
          lastAlertAt: new Date(Date.now()),
        },
      });

      this.logger.warn(
        `Device ${device.id} ficou OFFLINE lastSeen=${device.lastSeen ? device.lastSeen.toISOString() : 'null'}`,
      );
      // TODO: enviar webhook de offline no proximo passo
    }

    const hasConfigurableRules = await this.processConfiguredTemperatureRules();
    if (!hasConfigurableRules) {
      await this.processLegacyDeviceThresholds(temperatureCooldownMinutes);
    }
  }

  private async processConfiguredTemperatureRules() {
    const rules = await this.prisma.alertRule.findMany({
      where: {
        enabled: true,
        sensorType: 'temperature',
      },
      orderBy: { createdAt: 'asc' },
    } as any);

    if (rules.length === 0) {
      this.logger.debug('No configurable temperature rules enabled; using legacy device thresholds');
      return false;
    }

    this.logger.log(`Processing configurable temperature rules count=${rules.length}`);

    const devicesByClient = new Map<string, any[]>();

    for (const rule of rules as any[]) {
      let devices: any[] = [];

      if (rule.deviceId) {
        const device = await this.prisma.device.findUnique({
          where: { id: rule.deviceId },
        });
        if (device && (device as any).clientId === rule.clientId) {
          devices = [device];
        }
      } else {
        if (!devicesByClient.has(rule.clientId)) {
          const clientDevices = await this.prisma.device.findMany({
            where: { clientId: rule.clientId },
          } as any);
          devicesByClient.set(rule.clientId, clientDevices);
        }
        devices = devicesByClient.get(rule.clientId) ?? [];
      }

      for (const device of devices) {
        await this.evaluateTemperatureRuleForDevice(rule, device);
      }
    }

    return true;
  }

  private async evaluateTemperatureRuleForDevice(rule: any, device: any) {
    const lastLog = await this.prisma.temperatureLog.findFirst({
      where: { deviceId: device.id },
      orderBy: { createdAt: 'desc' },
    });

    if (!lastLog) return;

    const temperature = lastLog.temperature;
    const below = rule.minValue != null && temperature < rule.minValue;
    const above = rule.maxValue != null && temperature > rule.maxValue;
    const outOfRange = below || above;

    const now = new Date(Date.now());
    const state = await this.prisma.alertRuleState.upsert({
      where: {
        ruleId_deviceId: {
          ruleId: rule.id,
          deviceId: device.id,
        },
      } as any,
      update: {},
      create: {
        ruleId: rule.id,
        deviceId: device.id,
      } as any,
    } as any);

    if (!outOfRange) {
      if ((state as any).breachStartedAt) {
        this.logger.debug(
          `Temperature back to normal for device=${device.id} rule=${rule.id} temperature=${temperature}`,
        );
        await this.prisma.alertRuleState.update({
          where: { id: (state as any).id },
          data: { breachStartedAt: null },
        } as any);
      }
      return;
    }

    const breachStartedAt = (state as any).breachStartedAt ?? now;
    if (!(state as any).breachStartedAt) {
      await this.prisma.alertRuleState.update({
        where: { id: (state as any).id },
        data: { breachStartedAt },
      } as any);
    }

    const toleranceMs = (rule.toleranceMinutes ?? 0) * 60 * 1000;
    if (now.getTime() - breachStartedAt.getTime() < toleranceMs) {
      this.logger.debug(
        `Tolerance window active for device=${device.id} rule=${rule.id} temperature=${temperature}`,
      );
      return;
    }

    const cooldownMs = (rule.cooldownMinutes ?? 5) * 60 * 1000;
    const lastTriggeredAt = (state as any).lastTriggeredAt as Date | null;
    if (
      lastTriggeredAt &&
      now.getTime() - lastTriggeredAt.getTime() < cooldownMs
    ) {
      this.logger.debug(
        `Cooldown active for device=${device.id} rule=${rule.id} temperature=${temperature}`,
      );
      return;
    }

    this.logger.warn(
      `Rule ${rule.id} alerta de temperatura para device ${device.id}: ${temperature} (limites ${rule.minValue}-${rule.maxValue})`,
    );

    await this.sendTemperatureAlert({
      deviceId: device.id,
      clientId: rule.clientId,
      ruleId: rule.id,
      temperature,
      minTemperature: rule.minValue ?? null,
      maxTemperature: rule.maxValue ?? null,
      occurredAt: now.toISOString(),
    });

    await this.prisma.alertRuleState.update({
      where: { id: (state as any).id },
      data: {
        breachStartedAt,
        lastTriggeredAt: now,
      },
    } as any);

    await this.prisma.device.update({
      where: { id: device.id },
      data: { lastAlertAt: now },
    });
  }

  private async processLegacyDeviceThresholds(temperatureCooldownMinutes: number) {
    const devicesWithLimits = await this.prisma.device.findMany({
      where: {
        OR: [{ minTemperature: { not: null } }, { maxTemperature: { not: null } }],
      },
    } as any);

    for (const device of devicesWithLimits as any[]) {
      const lastLog = await this.prisma.temperatureLog.findFirst({
        where: { deviceId: device.id },
        orderBy: { createdAt: 'desc' },
      });

      if (!lastLog) continue;

      const temp = lastLog.temperature;
      const below = device.minTemperature != null && temp < device.minTemperature;
      const above = device.maxTemperature != null && temp > device.maxTemperature;

      if (below || above) {
        const now = new Date(Date.now());
        const cooldownMs = temperatureCooldownMinutes * 60 * 1000;
        const lastAlert = device.lastAlertAt?.getTime() ?? 0;

        if (now.getTime() - lastAlert > cooldownMs) {
          await this.prisma.device.update({
            where: { id: device.id },
            data: { lastAlertAt: now },
          });

          this.logger.warn(
            `Device ${device.id} temperatura fora do limite: ${temp} (limites ${device.minTemperature}-${device.maxTemperature})`,
          );

          await this.sendTemperatureAlert({
            deviceId: device.id,
            clientId: (device as any).clientId ?? null,
            ruleId: null,
            temperature: temp,
            minTemperature: device.minTemperature ?? null,
            maxTemperature: device.maxTemperature ?? null,
            occurredAt: now.toISOString(),
          });
        }
      }
    }
  }

  private async sendTemperatureAlert(payload: {
    deviceId: string;
    clientId: string | null;
    ruleId: string | null;
    temperature: number;
    minTemperature: number | null;
    maxTemperature: number | null;
    occurredAt: string;
  }) {
    this.logger.log(
      `Queueing temperature alert device=${payload.deviceId} rule=${payload.ruleId ?? 'legacy'} temperature=${payload.temperature}`,
    );
    this.alertQueue.enqueue({
      type: 'temperature_out_of_range',
      clientId: payload.clientId,
      ruleId: payload.ruleId,
      deviceId: payload.deviceId,
      temperature: payload.temperature,
      minTemperature: payload.minTemperature,
      maxTemperature: payload.maxTemperature,
      occurredAt: payload.occurredAt,
    });
  }
}
