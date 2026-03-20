import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpsertClientModuleDto } from './dto/upsert-client-module.dto';

const SUPPORTED_MODULE_KEYS = new Set(['ambiental', 'acionamento', 'energia']);

const FALLBACK_MODULES = [
  {
    key: 'ambiental',
    name: 'Ambiental',
    description:
      'Monitoramento ambiental com sensores como temperatura, umidade e gases.',
    items: [
      {
        key: 'temperatura',
        name: 'Temperatura',
        description: 'Leitura e alertas de temperatura.',
      },
      {
        key: 'umidade',
        name: 'Umidade',
        description: 'Leitura e alertas de umidade relativa do ar.',
      },
      {
        key: 'gases',
        name: 'Gases',
        description: 'Leitura e alertas de gases ambientais.',
      },
    ],
  },
  {
    key: 'acionamento',
    name: 'Acionamento',
    description:
      'Controle e telemetria operacional de saidas, estados e eventos de abertura.',
    items: [
      {
        key: 'rele',
        name: 'Rele',
        description: 'Comando liga/desliga de cargas.',
      },
      {
        key: 'status_abertura',
        name: 'Status de abertura',
        description: 'Estado aberto/fechado de portas e acessos.',
      },
      {
        key: 'tempo_aberto',
        name: 'Tempo aberto',
        description: 'Medicao do tempo acumulado em estado aberto.',
      },
    ],
  },
  {
    key: 'energia',
    name: 'Energia',
    description:
      'Medicoes eletricas e consumo para gestao energetica de equipamentos.',
    items: [
      {
        key: 'corrente',
        name: 'Corrente',
        description: 'Medicao de corrente eletrica.',
      },
      {
        key: 'tensao',
        name: 'Tensao',
        description: 'Medicao de tensao eletrica.',
      },
      {
        key: 'consumo',
        name: 'Consumo',
        description: 'Medicao de consumo energetico.',
      },
    ],
  },
] as const;

@Injectable()
export class ClientModulesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(clientId: string) {
    await this.ensureClientExists(clientId);

    const [catalogRows, accessRows] = await Promise.all([
      this.prisma.moduleCatalog.findMany({
        include: {
          items: {
            orderBy: { key: 'asc' },
          },
        },
        orderBy: { key: 'asc' },
      } as any),
      this.prisma.clientModuleItem.findMany({
        where: { clientId },
        orderBy: { itemKey: 'asc' },
      } as any),
    ]);

    const modules = catalogRows.length > 0 ? catalogRows : FALLBACK_MODULES;
    const accessByItemKey = new Map(accessRows.map((row: any) => [row.itemKey, row]));

    return modules.map((module: any) => {
      const items = (module.items ?? []).map((item: any) => {
        const access = accessByItemKey.get(item.key);
        const enabled = access?.enabled ?? false;

        return {
          id: access?.id ?? `${clientId}:${item.key}`,
          clientId,
          itemKey: item.key,
          moduleKey: module.key,
          name: item.name,
          description: item.description ?? '',
          enabled,
          createdAt: access?.createdAt ?? null,
          updatedAt: access?.updatedAt ?? null,
        };
      });

      const enabled = items.some((item: any) => item.enabled);

      return {
        id: `${clientId}:${module.key}`,
        clientId,
        moduleKey: module.key,
        name: module.name,
        description: module.description ?? '',
        enabled,
        createdAt: module.createdAt ?? null,
        updatedAt: module.updatedAt ?? null,
        items,
      };
    });
  }

  async upsert(dto: UpsertClientModuleDto) {
    await this.ensureClientExists(dto.clientId);

    if (!this.normalizeModuleKey(dto.moduleKey)) {
      throw new BadRequestException('moduleKey is not supported');
    }
    const normalizedModuleKey = dto.moduleKey;

    if (dto.itemKey) {
      const item = await this.prisma.moduleCatalogItem.findUnique({
        where: { key: dto.itemKey },
      } as any);

      if (!item) {
        throw new BadRequestException('itemKey is not supported');
      }

      if ((item as any).moduleKey !== normalizedModuleKey) {
        throw new BadRequestException('itemKey does not belong to moduleKey');
      }

      await this.prisma.clientModuleItem.upsert({
        where: {
          clientId_itemKey: {
            clientId: dto.clientId,
            itemKey: dto.itemKey,
          },
        },
        update: {
          enabled: dto.enabled,
        },
        create: {
          clientId: dto.clientId,
          itemKey: dto.itemKey,
          enabled: dto.enabled,
        },
      } as any);
    } else {
      const moduleItems = await this.prisma.moduleCatalogItem.findMany({
        where: { moduleKey: normalizedModuleKey },
      } as any);

      if (moduleItems.length === 0) {
        throw new BadRequestException(
          'moduleKey has no items in catalog. Seed module catalog first.',
        );
      }

      await Promise.all(
        moduleItems.map((item: any) =>
          this.prisma.clientModuleItem.upsert({
            where: {
              clientId_itemKey: {
                clientId: dto.clientId,
                itemKey: item.key,
              },
            },
            update: {
              enabled: dto.enabled,
            },
            create: {
              clientId: dto.clientId,
              itemKey: item.key,
              enabled: dto.enabled,
            },
          } as any),
        ),
      );
    }

    const modules = await this.list(dto.clientId);
    return modules.find((module) => module.moduleKey === normalizedModuleKey);
  }

  private async ensureClientExists(clientId: string) {
    const client = await this.prisma.client.findUnique({ where: { id: clientId } });
    if (!client) {
      throw new BadRequestException('clientId does not exist');
    }
  }

  private normalizeModuleKey(moduleKey: string) {
    return SUPPORTED_MODULE_KEYS.has(moduleKey);
  }
}

