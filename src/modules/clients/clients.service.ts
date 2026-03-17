import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
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

    return this.prisma.client.create({
      data: {
        id: dto.id,
        name: dto.name,
        adminName: dto.adminName.trim(),
        document,
        phone: adminPhone,
        adminPhone,
        alertPhone,
        billingName: dto.billingName?.trim() ?? dto.adminName.trim(),
        billingPhone,
        billingEmail: dto.billingEmail.trim(),
        status: dto.status ?? 'active',
        notes: dto.notes,
      },
    });
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

    return this.prisma.client.update({
      where: { id },
      data: {
        name: dto.name,
        adminName: dto.adminName?.trim(),
        document,
        phone: dto.adminPhone != null ? adminPhone : undefined,
        adminPhone: dto.adminPhone != null ? adminPhone : undefined,
        alertPhone: dto.alertPhone != null ? alertPhone : undefined,
        billingName: dto.billingName?.trim(),
        billingPhone: dto.billingPhone != null ? billingPhone : undefined,
        billingEmail: dto.billingEmail?.trim(),
        status: dto.status,
        notes: dto.notes,
      },
    });
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
    const candidates = [
      ...new Set([phones.adminPhone, phones.alertPhone, phones.billingPhone].filter(Boolean)),
    ];

    for (const phone of candidates) {
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
      });

      if (duplicatedPhone) {
        throw new ConflictException('Ja existe um cliente com este telefone');
      }
    }
  }
}
