import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
  RequestTimeoutException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateDeviceDto } from './dto/update-device.dto';
import { CreateDeviceDto } from './dto/create-device.dto';
import { CacheService } from '../../infra/cache/cache.service';
import { AuditTrailService } from '../../infra/audit/audit-trail.service';
import type { SessionUser } from '../auth/auth.types';

type UpdateDeviceOptions = {
  actor?: SessionUser;
  allowCreateIfMissing?: boolean;
  restrictToTemperatureBounds?: boolean;
};

@Injectable()
export class DevicesService {
  private readonly logger = new Logger(DevicesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheService,
    private readonly configService: ConfigService,
    private readonly auditTrail: AuditTrailService,
  ) {}

  async create(dto: CreateDeviceDto) {
    if (!dto.clientId) {
      throw new BadRequestException('clientId is required');
    }

    if (!dto.name?.trim()) {
      throw new BadRequestException('name is required');
    }

    // Evita cadastrar limites invertidos, o que quebraria monitoramento e UI.
    if (
      dto.minTemperature != null &&
      dto.maxTemperature != null &&
      dto.minTemperature > dto.maxTemperature
    ) {
      throw new BadRequestException(
        'minTemperature must be less than or equal to maxTemperature',
      );
    }

    const data: any = {
      id: dto.id,
      clientId: dto.clientId,
      name: dto.name?.trim(),
      location: dto.location,
      monitoringIntervalSeconds: dto.monitoringIntervalSeconds,
      offlineAlertDelayMinutes: dto.offlineAlertDelayMinutes,
      minTemperature: dto.minTemperature,
      maxTemperature: dto.maxTemperature,
      isOffline: false,
    };

    await this.ensureUniqueDeviceNamePerClient({
      clientId: dto.clientId,
      name: dto.name,
    });

    this.logger.log(
      `Creating device id=${dto.id} clientId=${dto.clientId ?? 'null'}`,
    );

    const created = await this.runWithTimeout(
      this.prisma.device.create({ data }),
      `create device id=${dto.id}`,
    );

    this.logger.log(`Created device id=${created.id}`);
    this.invalidateDeviceCaches();
    return created;
  }

  async listForDashboard(clientId?: string, limit = 100) {
    // O dashboard e muito consultado; por isso normalizamos limite e usamos cache curto.
    const normalizedLimit = Number.isFinite(limit) ? limit : 100;
    const safeLimit = Math.max(1, Math.min(normalizedLimit, 500));
    const cacheKey = `devices:dashboard:${clientId ?? 'all'}:${safeLimit}`;
    const cached = this.cache.get<any[]>(cacheKey);
    if (cached) return cached;

    const devices = await this.prisma.device.findMany({
      where: clientId ? ({ clientId } as any) : undefined,
      orderBy: { id: 'asc' },
      take: safeLimit,
    });

    if (devices.length === 0) return [];

    const deviceIds = devices.map((d) => d.id);
    const latestLogs = await this.prisma.temperatureLog.findMany({
      where: { deviceId: { in: deviceIds } },
      distinct: ['deviceId'],
      orderBy: [{ deviceId: 'asc' }, { createdAt: 'desc' }],
    });

    const latestByDevice = new Map(
      latestLogs.map((log) => [
        log.deviceId,
        { temperature: log.temperature, createdAt: log.createdAt },
      ]),
    );

    const payload = devices.map((device) => {
      // Junta cadastro do device com a ultima leitura para evitar multiplas chamadas no frontend.
      const latest = latestByDevice.get(device.id);
      return {
        id: device.id,
        clientId: (device as any).clientId ?? null,
        name: device.name,
        location: device.location,
        isOffline: device.isOffline,
        lastSeen: device.lastSeen,
        offlineSince: device.offlineSince,
        minTemperature: (device as any).minTemperature ?? null,
        maxTemperature: (device as any).maxTemperature ?? null,
        monitoringIntervalSeconds:
          (device as any).monitoringIntervalSeconds ?? null,
        offlineAlertDelayMinutes:
          (device as any).offlineAlertDelayMinutes ?? null,
        lastTemperature: latest?.temperature ?? null,
        lastReadingAt: latest?.createdAt ?? null,
      };
    });

    this.cache.set(cacheKey, payload, this.getCacheTtlSeconds());
    return payload;
  }

  async findOne(id: string, clientId?: string) {
    // A validacao de clientId impede que um tenant consulte device de outro tenant.
    const device = await this.prisma.device.findUnique({ where: { id } });
    if (clientId) {
      if (!device || (device as any).clientId !== clientId) {
        throw new NotFoundException('Device not found for client');
      }
      return device;
    }
    if (!device) return null;
    return device;
  }

  async getTemperatureHistory(id: string, limit = 100, clientId?: string) {
    if (clientId) {
      await this.ensureDeviceBelongsToClient(id, clientId);
    }

    const normalizedLimit = Number.isFinite(limit) ? limit : 100;
    const safeLimit = Math.max(1, Math.min(normalizedLimit, 500));

    const cacheKey = `devices:history:${id}:${clientId ?? 'all'}:${safeLimit}`;
    const cached = this.cache.get<any[]>(cacheKey);
    if (cached) return cached;

    const rows = await this.prisma.temperatureLog.findMany({
      where: { deviceId: id },
      orderBy: { createdAt: 'desc' },
      take: safeLimit,
    });

    const payload = rows
      .slice()
      .reverse()
      .map((row) => ({
        temperature: row.temperature,
        createdAt: row.createdAt,
      }));

    this.cache.set(cacheKey, payload, this.getCacheTtlSeconds());
    return payload;
  }

  async remove(id: string, clientId?: string) {
    const existing = clientId
      ? await this.ensureDeviceBelongsToClient(id, clientId)
      : await this.prisma.device.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Device not found');
    }

    await this.prisma.temperatureLog.deleteMany({
      where: { deviceId: id },
    });

    const deleted = await this.prisma.device.delete({ where: { id } });
    this.invalidateDeviceCaches();
    return deleted;
  }

  async update(
    id: string,
    dto: UpdateDeviceDto,
    clientId?: string,
    options: UpdateDeviceOptions = {},
  ) {
    if (
      dto.minTemperature != null &&
      dto.maxTemperature != null &&
      dto.minTemperature > dto.maxTemperature
    ) {
      throw new BadRequestException(
        'minTemperature must be less than or equal to maxTemperature',
      );
    }

    if (clientId && dto.clientId && dto.clientId !== clientId) {
      throw new BadRequestException(
        'clientId in body must match clientId query parameter',
      );
    }

    if (clientId) {
      const existing = await this.prisma.device.findUnique({ where: { id } });
      if (existing && (existing as any).clientId !== clientId) {
        throw new NotFoundException('Device not found for client');
      }
    }

    const existing = await this.prisma.device.findUnique({ where: { id } });

    if (options.restrictToTemperatureBounds) {
      const hasStructuralFields =
        dto.clientId !== undefined ||
        dto.name !== undefined ||
        dto.location !== undefined ||
        dto.monitoringIntervalSeconds !== undefined ||
        dto.offlineAlertDelayMinutes !== undefined;

      if (hasStructuralFields) {
        throw new ForbiddenException(
          'Client admin can only update temperature bounds on devices',
        );
      }

      if (!existing) {
        throw new NotFoundException('Device not found');
      }
    }

    if (options.allowCreateIfMissing === false && !existing) {
      throw new NotFoundException('Device not found');
    }

    await this.ensureUniqueDeviceNamePerClient({
      clientId: clientId ?? dto.clientId ?? existing?.clientId ?? undefined,
      name: dto.name,
      ignoreDeviceId: existing?.id ?? id,
    });

    const data: any = {
      clientId: clientId ?? dto.clientId,
      name: dto.name,
      location: dto.location,
      monitoringIntervalSeconds: dto.monitoringIntervalSeconds,
      offlineAlertDelayMinutes: dto.offlineAlertDelayMinutes,
      minTemperature: dto.minTemperature,
      maxTemperature: dto.maxTemperature,
    };

    const upserted = existing
      ? await this.prisma.device.update({
          where: { id },
          data,
        })
      : await this.prisma.device.create({
          data: { id, ...(clientId ? { clientId } : {}), ...data, isOffline: false },
        });

    await this.recordTemperatureBoundsAudit(existing, upserted, options.actor);
    this.invalidateDeviceCaches();
    return upserted;
  }

  private async recordTemperatureBoundsAudit(
    previous: any | null,
    current: any,
    actor?: SessionUser,
  ) {
    const trackedFields = [
      {
        fieldName: 'minTemperature',
        previousValue: previous?.minTemperature ?? null,
        nextValue: current?.minTemperature ?? null,
      },
      {
        fieldName: 'maxTemperature',
        previousValue: previous?.maxTemperature ?? null,
        nextValue: current?.maxTemperature ?? null,
      },
    ];

    for (const field of trackedFields) {
      if (field.previousValue === field.nextValue) continue;

      await this.auditTrail.record({
        clientId: current?.clientId ?? previous?.clientId ?? null,
        entityType: 'device',
        entityId: current.id,
        action: previous ? 'temperature_bounds_updated' : 'temperature_bounds_created',
        fieldName: field.fieldName,
        previousValue: field.previousValue,
        nextValue: field.nextValue,
        actor,
      });
    }
  }

  private async ensureDeviceBelongsToClient(id: string, clientId: string) {
    const device = await this.prisma.device.findUnique({ where: { id } });
    if (!device || (device as any).clientId !== clientId) {
      throw new NotFoundException('Device not found for client');
    }
    return device;
  }

  private getCacheTtlSeconds() {
    return this.configService.get<number>('CACHE_TTL_SECONDS') ?? 15;
  }

  private async runWithTimeout<T>(operation: Promise<T>, label: string) {
    const timeoutMs = 10000;

    return Promise.race([
      operation,
      new Promise<T>((_, reject) => {
        setTimeout(() => {
          this.logger.error(`Timed out while trying to ${label}`);
          reject(
            new RequestTimeoutException(
              'A API demorou para concluir o cadastro do equipamento.',
            ),
          );
        }, timeoutMs);
      }),
    ]);
  }

  private invalidateDeviceCaches() {
    this.cache.invalidatePrefix('devices:dashboard:');
    this.cache.invalidatePrefix('devices:history:');
    this.cache.invalidatePrefix('readings:');
  }

  private async ensureUniqueDeviceNamePerClient(params: {
    clientId?: string;
    name?: string;
    ignoreDeviceId?: string;
  }) {
    const normalizedName = this.normalizeDeviceName(params.name);
    if (!params.clientId || !normalizedName) return;

    const devices = await this.prisma.device.findMany({
      where: { clientId: params.clientId },
      select: { id: true, name: true },
      take: 500,
      orderBy: { id: 'asc' },
    });

    const duplicate = devices.find((device) => {
      if (params.ignoreDeviceId && device.id === params.ignoreDeviceId) {
        return false;
      }
      return this.normalizeDeviceName(device.name) === normalizedName;
    });

    if (duplicate) {
      throw new BadRequestException(
        'Ja existe equipamento com este nome neste cliente. Use outro nome.',
      );
    }
  }

  private normalizeDeviceName(value?: string | null) {
    if (!value) return '';
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[_-]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }
}
