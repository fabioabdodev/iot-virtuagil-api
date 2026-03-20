import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
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
    const document = normalizeClientDocument(dto.document);
    const adminPhone = normalizeClientPhone(dto.adminPhone);
    const alertPhone =
      dto.alertPhone != null
        ? normalizeClientPhone(dto.alertPhone)
        : adminPhone;
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

    return this.prisma.client.create({
      data: {
        id: dto.id,
        name: dto.name,
        adminName: dto.adminName.trim(),
        document,
        phone: adminPhone,
        adminPhone,
        alertPhone,
        deviceApiKey,
        billingName: dto.billingName?.trim() ?? dto.adminName.trim(),
        billingPhone,
        billingEmail: dto.billingEmail.trim(),
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
        : existing.adminPhone ?? existing.phone ?? undefined;
    const alertPhone =
      dto.alertPhone != null
        ? normalizeClientPhone(dto.alertPhone)
        : existing.alertPhone ?? adminPhone ?? existing.adminPhone ?? existing.phone ?? undefined;
    const billingPhone =
      dto.billingPhone != null
        ? normalizeClientPhone(dto.billingPhone)
        : existing.billingPhone ?? undefined;

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

    return this.prisma.client.update({
      where: { id },
      data: {
        name: dto.name,
        adminName: dto.adminName?.trim(),
        document,
        phone: dto.adminPhone != null ? adminPhone : undefined,
        adminPhone: dto.adminPhone != null ? adminPhone : undefined,
        alertPhone: dto.alertPhone != null ? alertPhone : undefined,
        deviceApiKey,
        billingName: dto.billingName?.trim(),
        billingPhone: dto.billingPhone != null ? billingPhone : undefined,
        billingEmail: dto.billingEmail?.trim(),
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
      { key: 'adminPhone', label: 'Contato do administrador', value: phones.adminPhone },
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
