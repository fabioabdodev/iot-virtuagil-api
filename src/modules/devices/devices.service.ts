import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateDeviceDto } from './dto/update-device.dto';
import { CreateDeviceDto } from './dto/create-device.dto';
import { CacheService } from '../../infra/cache/cache.service';

@Injectable()
export class DevicesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheService,
    private readonly configService: ConfigService,
  ) {}

  async create(dto: CreateDeviceDto) {
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
      name: dto.name,
      location: dto.location,
      minTemperature: dto.minTemperature,
      maxTemperature: dto.maxTemperature,
      isOffline: false,
    };

    const created = await this.prisma.device.create({ data });
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

  async update(id: string, dto: UpdateDeviceDto, clientId?: string) {
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

    const data: any = {
      clientId: clientId ?? dto.clientId,
      name: dto.name,
      location: dto.location,
      minTemperature: dto.minTemperature,
      maxTemperature: dto.maxTemperature,
    };

    const upserted = await this.prisma.device.upsert({
      where: { id },
      update: data,
      create: { id, ...(clientId ? { clientId } : {}), ...data },
    });
    this.invalidateDeviceCaches();
    return upserted;
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

  private invalidateDeviceCaches() {
    this.cache.invalidatePrefix('devices:dashboard:');
    this.cache.invalidatePrefix('devices:history:');
    this.cache.invalidatePrefix('readings:');
  }
}
