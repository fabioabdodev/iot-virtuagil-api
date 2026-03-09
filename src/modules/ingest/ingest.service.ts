import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { TemperatureDto } from './dto/temperature.dto';
import { CacheService } from '../../infra/cache/cache.service';

@Injectable()
export class IngestService {
  private readonly logger = new Logger(IngestService.name);
  private readonly requestTimestampsByDevice = new Map<string, number[]>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly cache: CacheService,
  ) {}

  async ingestTemperature(body: TemperatureDto) {
    this.enforceDeviceRateLimit(body.device_id);

    const receivedAt = new Date();

    await this.prisma.temperatureLog.create({
      data: {
        deviceId: body.device_id,
        temperature: body.temperature,
      },
    });

    await this.prisma.device.upsert({
      where: { id: body.device_id },
      update: {
        lastSeen: receivedAt,
        isOffline: false,
        offlineSince: null,
      },
      create: {
        id: body.device_id,
        lastSeen: receivedAt,
        isOffline: false,
      },
    });

    this.cache.invalidatePrefix('devices:dashboard:');
    this.cache.invalidatePrefix('devices:history:');
    this.cache.invalidatePrefix('readings:');

    this.logger.debug(
      `Persisted temperature for device_id=${body.device_id} temperature=${body.temperature} receivedAt=${receivedAt.toISOString()}`,
    );
  }

  private enforceDeviceRateLimit(deviceId: string) {
    const windowSeconds =
      this.configService.get<number>('DEVICE_RATE_LIMIT_WINDOW_SECONDS') ?? 60;
    const maxRequests =
      this.configService.get<number>('DEVICE_RATE_LIMIT_MAX_REQUESTS') ?? 30;
    const maxTrackedDevices =
      this.configService.get<number>('DEVICE_RATE_LIMIT_MAX_TRACKED_DEVICES') ??
      10000;

    const now = Date.now();
    const windowStart = now - windowSeconds * 1000;

    const previous = this.requestTimestampsByDevice.get(deviceId) ?? [];
    const recent = previous.filter((ts) => ts > windowStart);

    if (recent.length >= maxRequests) {
      this.logger.warn(
        `Rate limit exceeded for device_id=${deviceId} in window=${windowSeconds}s max=${maxRequests}`,
      );
      throw new HttpException(
        'Rate limit exceeded for device',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    recent.push(now);
    this.requestTimestampsByDevice.set(deviceId, recent);
    this.compactRateLimitStore(windowStart, maxTrackedDevices);
  }

  private compactRateLimitStore(windowStart: number, maxTrackedDevices: number) {
    for (const [id, timestamps] of this.requestTimestampsByDevice.entries()) {
      const filtered = timestamps.filter((ts) => ts > windowStart);
      if (filtered.length === 0) {
        this.requestTimestampsByDevice.delete(id);
      } else {
        this.requestTimestampsByDevice.set(id, filtered);
      }
    }

    while (this.requestTimestampsByDevice.size > maxTrackedDevices) {
      const oldestKey = this.requestTimestampsByDevice.keys().next().value as
        | string
        | undefined;
      if (!oldestKey) break;
      this.requestTimestampsByDevice.delete(oldestKey);
    }
  }
}
