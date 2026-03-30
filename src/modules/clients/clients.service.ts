import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomBytes } from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import {
  normalizeClientDocument,
  normalizeClientPhone,
} from './client-contact.utils';

@Injectable()
export class ClientsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateClientDto) {
    const trimmedName = dto.name?.trim();
    const trimmedAdminName = dto.adminName?.trim();
    const trimmedAlertContactName = dto.alertContactName?.trim();
    const trimmedBillingEmail = dto.billingEmail?.trim();
    if (!trimmedName) {
      throw new BadRequestException('Nome do cliente obrigatorio');
    }
    if (!trimmedAdminName) {
      throw new BadRequestException('Nome do contato principal obrigatorio');
    }
    if (!trimmedAlertContactName) {
      throw new BadRequestException('Nome do contato de alertas obrigatorio');
    }
    if (!trimmedBillingEmail) {
      throw new BadRequestException('Email financeiro obrigatorio');
    }

    const document = normalizeClientDocument(dto.document);
    const adminPhone = normalizeClientPhone(dto.adminPhone);
    const alertPhone = normalizeClientPhone(dto.alertPhone);
    const billingPhone = normalizeClientPhone(dto.billingPhone);
    const duplicatedId = await this.prisma.client.findUnique({
      where: { id: dto.id },
    });

    if (duplicatedId) {
      throw new ConflictException('Ja existe um cliente com este clientId');
    }

    if (document) {
      const duplicatedDocument = await this.prisma.client.findFirst({
        where: { document },
      });

      if (duplicatedDocument) {
        throw new ConflictException('Ja existe um cliente com este CPF ou CNPJ');
      }
    }

    await this.ensurePhonesAreUnique({
      adminPhone,
      alertPhone,
      billingPhone,
    });

    const deviceApiKey = this.resolveClientDeviceApiKey(dto.id, dto.deviceApiKey);
    await this.ensureDeviceApiKeyIsUnique(deviceApiKey);
    const monitoringIntervalSeconds = this.resolveMonitoringIntervalSeconds(
      dto.monitoringIntervalSeconds,
    );
    const offlineAlertDelayMinutes = this.resolveOfflineAlertDelayMinutes(
      dto.offlineAlertDelayMinutes,
      monitoringIntervalSeconds,
    );

    return this.prisma.client.create({
      data: {
        id: dto.id,
        name: trimmedName,
        adminName: trimmedAdminName,
        alertContactName: trimmedAlertContactName,
        document,
        phone: adminPhone,
        adminPhone,
        alertPhone,
        actuationNotifyCooldownMinutes: dto.actuationNotifyCooldownMinutes,
        deviceApiKey,
        monitoringIntervalSeconds,
        offlineAlertDelayMinutes,
        billingName: dto.billingName?.trim() ?? trimmedAdminName,
        billingPhone,
        billingEmail: trimmedBillingEmail,
        status: dto.status ?? 'active',
        notes: dto.notes,
      },
    } as any);
  }

  async list() {
    return this.prisma.client.findMany({
      orderBy: { id: 'asc' },
    });
  }

  async findOne(id: string) {
    const client = await this.prisma.client.findUnique({ where: { id } });
    if (!client) throw new NotFoundException('Client not found');
    return client;
  }

  async update(id: string, dto: UpdateClientDto) {
    const existing = await this.findOne(id);
    const nextName =
      dto.name !== undefined ? dto.name.trim() : existing.name?.trim();
    const nextAdminName =
      dto.adminName !== undefined ? dto.adminName.trim() : existing.adminName?.trim();
    const nextAlertContactName =
      dto.alertContactName !== undefined
        ? dto.alertContactName.trim()
        : existing.alertContactName?.trim() ?? existing.adminName?.trim();
    const nextBillingEmail = dto.billingEmail?.trim();

    if (!nextName) {
      throw new BadRequestException('Nome do cliente obrigatorio');
    }
    if (!nextAdminName) {
      throw new BadRequestException('Nome do contato principal obrigatorio');
    }
    if (!nextAlertContactName) {
      throw new BadRequestException('Nome do contato de alertas obrigatorio');
    }
    if (dto.billingEmail !== undefined && !nextBillingEmail) {
      throw new BadRequestException('Email financeiro obrigatorio');
    }

    const document = normalizeClientDocument(dto.document);
    if (document) {
      const duplicatedDocument = await this.prisma.client.findFirst({
        where: {
          document,
          id: { not: id },
        },
      });

      if (duplicatedDocument) {
        throw new ConflictException('Ja existe um cliente com este CPF ou CNPJ');
      }
    }

    const adminPhone =
      dto.adminPhone != null
        ? normalizeClientPhone(dto.adminPhone)
        : existing.adminPhone ?? existing.phone ?? '';
    const alertPhone =
      dto.alertPhone != null
        ? normalizeClientPhone(dto.alertPhone)
        : existing.alertPhone ?? adminPhone ?? existing.adminPhone ?? existing.phone ?? '';
    const billingPhone =
      dto.billingPhone != null
        ? normalizeClientPhone(dto.billingPhone)
        : existing.billingPhone ?? undefined;

    if (!adminPhone) {
      throw new BadRequestException('WhatsApp do contato principal obrigatorio');
    }
    if (!alertPhone) {
      throw new BadRequestException('WhatsApp principal para alertas obrigatorio');
    }

    await this.ensurePhonesAreUnique(
      {
        adminPhone,
        alertPhone,
        billingPhone,
      },
      id,
    );

    const deviceApiKey = dto.regenerateDeviceApiKey
      ? this.generateClientDeviceApiKey(id)
      : this.resolveClientDeviceApiKey(
          id,
          dto.deviceApiKey,
          (existing as any).deviceApiKey ?? undefined,
        );
    await this.ensureDeviceApiKeyIsUnique(deviceApiKey, id);
    const monitoringIntervalSeconds = this.resolveMonitoringIntervalSeconds(
      dto.monitoringIntervalSeconds,
      (existing as any).monitoringIntervalSeconds,
    );
    const offlineAlertDelayMinutes = this.resolveOfflineAlertDelayMinutes(
      dto.offlineAlertDelayMinutes,
      monitoringIntervalSeconds,
      (existing as any).offlineAlertDelayMinutes,
    );

    return this.prisma.client.update({
      where: { id },
      data: {
        name: nextName,
        adminName: nextAdminName,
        alertContactName: nextAlertContactName,
        document,
        phone: adminPhone,
        adminPhone,
        alertPhone,
        actuationNotifyCooldownMinutes: dto.actuationNotifyCooldownMinutes,
        deviceApiKey,
        monitoringIntervalSeconds,
        offlineAlertDelayMinutes,
        billingName: dto.billingName?.trim(),
        billingPhone: dto.billingPhone != null ? billingPhone : undefined,
        billingEmail: nextBillingEmail,
        status: dto.status,
        notes: dto.notes,
      },
    } as any);
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.client.delete({ where: { id } });
  }

  private async ensurePhonesAreUnique(
    phones: {
      adminPhone?: string;
      alertPhone?: string;
      billingPhone?: string;
    },
    ignoredClientId?: string,
  ) {
    const phoneEntries = [
      { key: 'adminPhone', label: 'WhatsApp do contato principal', value: phones.adminPhone },
      { key: 'alertPhone', label: 'WhatsApp principal para alertas', value: phones.alertPhone },
      { key: 'billingPhone', label: 'Contato financeiro', value: phones.billingPhone },
    ].filter((entry): entry is { key: string; label: string; value: string } => Boolean(entry.value));

    const candidatesByPhone = new Map<
      string,
      Array<{ key: string; label: string }>
    >();

    for (const entry of phoneEntries) {
      const current = candidatesByPhone.get(entry.value) ?? [];
      current.push({ key: entry.key, label: entry.label });
      candidatesByPhone.set(entry.value, current);
    }

    for (const [phone, fields] of candidatesByPhone.entries()) {
      const duplicatedPhone = await this.prisma.client.findFirst({
        where: {
          id: ignoredClientId ? { not: ignoredClientId } : undefined,
          OR: [
            { phone },
            { adminPhone: phone },
            { alertPhone: phone },
            { billingPhone: phone },
          ],
        },
        select: {
          id: true,
          name: true,
        },
      });

      if (duplicatedPhone) {
        const fieldLabels = fields.map((field) => field.label);
        const fieldKeys = fields.map((field) => field.key);
        const fieldContext =
          fieldLabels.length > 1
            ? `Campos: ${fieldLabels.join(', ')}`
            : `Campo: ${fieldLabels[0]}`;

        throw new ConflictException(
          `Ja existe um cliente com este telefone: ${duplicatedPhone.name} (${duplicatedPhone.id}). ${fieldContext}. [field:${fieldKeys.join('|')}]`,
        );
      }
    }
  }

  private resolveClientDeviceApiKey(
    clientId: string,
    providedKey?: string,
    currentKey?: string,
  ) {
    const normalizedKey = providedKey?.trim();

    if (normalizedKey) {
      return normalizedKey;
    }

    if (currentKey) {
      return currentKey;
    }

    return this.generateClientDeviceApiKey(clientId);
  }

  private generateClientDeviceApiKey(clientId: string) {
    return `dvk_${clientId}_${randomBytes(10).toString('hex')}`;
  }

  private resolveMonitoringIntervalSeconds(
    providedValue?: number,
    currentValue?: number,
  ) {
    if (providedValue != null) {
      return Math.floor(providedValue);
    }

    if (currentValue != null) {
      return currentValue;
    }

    return 300;
  }

  private resolveOfflineAlertDelayMinutes(
    providedValue: number | undefined,
    monitoringIntervalSeconds: number,
    currentValue?: number,
  ) {
    if (providedValue != null) {
      return Math.floor(providedValue);
    }

    if (currentValue != null) {
      return currentValue;
    }

    return Math.max(5, Math.ceil((monitoringIntervalSeconds * 3) / 60));
  }

  private async ensureDeviceApiKeyIsUnique(
    deviceApiKey: string,
    ignoredClientId?: string,
  ) {
    const duplicatedKey = await this.prisma.client.findFirst({
      where: {
        id: ignoredClientId ? { not: ignoredClientId } : undefined,
        deviceApiKey,
      },
      select: { id: true },
    } as any);

    if (duplicatedKey) {
      throw new ConflictException('Ja existe um cliente com esta chave de device');
    }
  }
}
