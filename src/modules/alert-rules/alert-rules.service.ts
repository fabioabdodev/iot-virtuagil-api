import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAlertRuleDto } from './dto/create-alert-rule.dto';
import { UpdateAlertRuleDto } from './dto/update-alert-rule.dto';
import { AuditTrailService } from '../../infra/audit/audit-trail.service';
import type { SessionUser } from '../auth/auth.types';

@Injectable()
export class AlertRulesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditTrail: AuditTrailService,
  ) {}

  async create(dto: CreateAlertRuleDto, actor?: SessionUser) {
    this.validateBounds(dto.minValue, dto.maxValue);
    await this.ensureClientExists(dto.clientId);
    await this.ensureDeviceBelongsToClient(dto.deviceId, dto.clientId);

    const created = await this.prisma.alertRule.create({
      data: {
        clientId: dto.clientId,
        deviceId: dto.deviceId,
        sensorType: dto.sensorType,
        minValue: dto.minValue,
        maxValue: dto.maxValue,
        cooldownMinutes: dto.cooldownMinutes ?? 5,
        toleranceMinutes: dto.toleranceMinutes ?? 0,
        enabled: dto.enabled ?? true,
      } as any,
    });

    await this.auditTrail.record({
      clientId: created.clientId,
      entityType: 'alert_rule',
      entityId: created.id,
      action: 'alert_rule_created',
      nextValue: created as any,
      actor,
    });

    return created;
  }

  async list(filters: {
    clientId?: string;
    deviceId?: string;
    sensorType?: string;
    enabled?: boolean;
  }) {
    const where: any = {};
    if (filters.clientId) where.clientId = filters.clientId;
    if (filters.deviceId) where.deviceId = filters.deviceId;
    if (filters.sensorType) where.sensorType = filters.sensorType;
    if (typeof filters.enabled === 'boolean') where.enabled = filters.enabled;

    return this.prisma.alertRule.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    } as any);
  }

  async findOne(id: string, clientId?: string) {
    const rule = await this.prisma.alertRule.findUnique({ where: { id } } as any);
    if (!rule) throw new NotFoundException('Alert rule not found');
    if (clientId && (rule as any).clientId !== clientId) {
      throw new NotFoundException('Alert rule not found for client');
    }
    return rule;
  }

  async update(
    id: string,
    dto: UpdateAlertRuleDto,
    clientId?: string,
    actor?: SessionUser,
  ) {
    const existing = await this.findOne(id, clientId);

    const nextClientId = clientId ?? dto.clientId ?? (existing as any).clientId;
    const nextDeviceId = dto.deviceId ?? (existing as any).deviceId;
    const nextMin = dto.minValue ?? (existing as any).minValue ?? undefined;
    const nextMax = dto.maxValue ?? (existing as any).maxValue ?? undefined;

    this.validateBounds(nextMin, nextMax);
    await this.ensureClientExists(nextClientId);
    await this.ensureDeviceBelongsToClient(nextDeviceId ?? undefined, nextClientId);

    const updated = await this.prisma.alertRule.update({
      where: { id },
      data: {
        clientId: nextClientId,
        deviceId: nextDeviceId,
        sensorType: dto.sensorType,
        minValue: dto.minValue,
        maxValue: dto.maxValue,
        cooldownMinutes: dto.cooldownMinutes,
        toleranceMinutes: dto.toleranceMinutes,
        enabled: dto.enabled,
      } as any,
    });

    await this.auditTrail.record({
      clientId: updated.clientId,
      entityType: 'alert_rule',
      entityId: updated.id,
      action: 'alert_rule_updated',
      previousValue: existing as any,
      nextValue: updated as any,
      actor,
    });

    return updated;
  }

  async remove(id: string, clientId?: string, actor?: SessionUser) {
    const existing = await this.findOne(id, clientId);
    const deleted = await this.prisma.alertRule.delete({ where: { id } } as any);

    await this.auditTrail.record({
      clientId: existing.clientId,
      entityType: 'alert_rule',
      entityId: existing.id,
      action: 'alert_rule_deleted',
      previousValue: existing as any,
      actor,
    });

    return deleted;
  }

  private validateBounds(minValue?: number, maxValue?: number) {
    if (minValue != null && maxValue != null && minValue > maxValue) {
      throw new BadRequestException(
        'minValue must be less than or equal to maxValue',
      );
    }
  }

  private async ensureClientExists(clientId: string) {
    const client = await this.prisma.client.findUnique({ where: { id: clientId } } as any);
    if (!client) throw new BadRequestException('clientId does not exist');
  }

  private async ensureDeviceBelongsToClient(deviceId: string | undefined, clientId: string) {
    if (!deviceId) return;
    const device = await this.prisma.device.findUnique({ where: { id: deviceId } });
    if (!device || (device as any).clientId !== clientId) {
      throw new BadRequestException('deviceId does not belong to clientId');
    }
  }
}
