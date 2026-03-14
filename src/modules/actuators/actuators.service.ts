import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateActuatorDto } from './dto/create-actuator.dto';
import { UpdateActuatorDto } from './dto/update-actuator.dto';
import { CreateActuationCommandDto } from './dto/create-actuation-command.dto';

@Injectable()
export class ActuatorsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateActuatorDto) {
    await this.ensureClientExists(dto.clientId);
    await this.ensureDeviceBelongsToClient(dto.deviceId, dto.clientId);

    return this.prisma.actuator.create({
      data: {
        id: dto.id,
        clientId: dto.clientId,
        deviceId: dto.deviceId,
        name: dto.name,
        location: dto.location,
        currentState: 'off',
      } as any,
    });
  }

  async list(filters: { clientId?: string; deviceId?: string; state?: string }) {
    const where: any = {};
    if (filters.clientId) where.clientId = filters.clientId;
    if (filters.deviceId) where.deviceId = filters.deviceId;
    if (filters.state) where.currentState = filters.state;

    return this.prisma.actuator.findMany({
      where,
      orderBy: { id: 'asc' },
    } as any);
  }

  async listForRuntime(deviceId: string) {
    const rows = await this.prisma.actuator.findMany({
      where: { deviceId },
      orderBy: { id: 'asc' },
    } as any);

    return rows.map((row: any) => ({
      id: row.id,
      deviceId: row.deviceId ?? null,
      name: row.name,
      currentState: row.currentState,
      lastCommandAt: row.lastCommandAt ?? null,
      lastCommandBy: row.lastCommandBy ?? null,
    }));
  }

  async findOne(id: string, clientId?: string) {
    const actuator = await this.prisma.actuator.findUnique({ where: { id } } as any);
    if (!actuator) throw new NotFoundException('Actuator not found');
    if (clientId && (actuator as any).clientId !== clientId) {
      throw new NotFoundException('Actuator not found for client');
    }
    return actuator;
  }

  async update(id: string, dto: UpdateActuatorDto, clientId?: string) {
    const existing = await this.findOne(id, clientId);
    const nextClientId = clientId ?? dto.clientId ?? (existing as any).clientId;
    const nextDeviceId =
      dto.deviceId === undefined ? (existing as any).deviceId : dto.deviceId;

    await this.ensureClientExists(nextClientId);
    await this.ensureDeviceBelongsToClient(nextDeviceId ?? undefined, nextClientId);

    return this.prisma.actuator.update({
      where: { id },
      data: {
        clientId: nextClientId,
        deviceId: nextDeviceId,
        name: dto.name,
        location: dto.location,
      } as any,
    });
  }

  async remove(id: string, clientId?: string) {
    await this.findOne(id, clientId);
    return this.prisma.actuator.delete({ where: { id } } as any);
  }

  async listCommands(actuatorId: string, limit = 20, clientId?: string) {
    await this.findOne(actuatorId, clientId);
    const safeLimit = Math.max(1, Math.min(Number.isFinite(limit) ? limit : 20, 100));

    return this.prisma.actuationCommand.findMany({
      where: { actuatorId },
      orderBy: { executedAt: 'desc' },
      take: safeLimit,
    } as any);
  }

  async listRecentCommands(limit = 20, clientId?: string) {
    const safeLimit = Math.max(1, Math.min(Number.isFinite(limit) ? limit : 20, 100));
    const where = clientId ? ({ clientId } as any) : undefined;

    return this.prisma.actuationCommand.findMany({
      where,
      orderBy: { executedAt: 'desc' },
      take: safeLimit,
      include: {
        actuator: true,
      },
    } as any);
  }

  async createCommand(
    actuatorId: string,
    dto: CreateActuationCommandDto,
    clientId?: string,
  ) {
    const actuator = await this.findOne(actuatorId, clientId);
    const now = new Date();

    const command = await this.prisma.actuationCommand.create({
      data: {
        actuatorId,
        clientId: (actuator as any).clientId,
        desiredState: dto.desiredState,
        source: dto.source,
        note: dto.note,
        executedAt: now,
      } as any,
    });

    await this.prisma.actuator.update({
      where: { id: actuatorId },
      data: {
        currentState: dto.desiredState,
        lastCommandAt: now,
        lastCommandBy: dto.source ?? 'manual',
      } as any,
    });

    return {
      ...(command as any),
      actuator: {
        ...(actuator as any),
        currentState: dto.desiredState,
        lastCommandAt: now,
        lastCommandBy: dto.source ?? 'manual',
      },
    };
  }

  private async ensureClientExists(clientId: string) {
    const client = await this.prisma.client.findUnique({ where: { id: clientId } } as any);
    if (!client) throw new BadRequestException('clientId does not exist');
  }

  private async ensureDeviceBelongsToClient(
    deviceId: string | undefined,
    clientId: string,
  ) {
    if (!deviceId) return;
    const device = await this.prisma.device.findUnique({ where: { id: deviceId } });
    if (!device || (device as any).clientId !== clientId) {
      throw new BadRequestException('deviceId does not belong to clientId');
    }
  }
}
