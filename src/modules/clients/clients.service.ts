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

    return this.prisma.client.create({
      data: {
        id: dto.id,
        name: dto.name,
        document,
        phone: normalizeClientPhone(dto.adminPhone),
        adminPhone: normalizeClientPhone(dto.adminPhone),
        billingPhone: normalizeClientPhone(dto.billingPhone),
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
    await this.findOne(id);

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

    return this.prisma.client.update({
      where: { id },
      data: {
        name: dto.name,
        document,
        phone:
          dto.adminPhone != null
            ? normalizeClientPhone(dto.adminPhone)
            : undefined,
        adminPhone:
          dto.adminPhone != null
            ? normalizeClientPhone(dto.adminPhone)
            : undefined,
        billingPhone:
          dto.billingPhone != null
            ? normalizeClientPhone(dto.billingPhone)
            : undefined,
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
}
