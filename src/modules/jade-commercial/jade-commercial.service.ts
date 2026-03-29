import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';
import { selectCrossSellModule } from './jade-commercial.utils';

type UpsertSalesLeadInput = {
  leadPhone: string;
  leadName?: string | null;
  isClient?: boolean;
  clientId?: string | null;
  interestTopic?: string | null;
  notes?: string | null;
};

type ScheduleCommercialFollowUpInput = {
  leadPhone: string;
  leadName?: string | null;
  interestTopic?: string | null;
  reason?: string | null;
  nextContactAt?: Date;
  offerType?: string | null;
  followUpStage?: string | null;
};

type CreateHumanHandoffInput = {
  leadPhone: string;
  leadName?: string | null;
  interestTopic?: string | null;
  summary?: string | null;
  commercialIntent?: string | null;
  sourceStage?: string | null;
  assignedTo?: string | null;
};

@Injectable()
export class JadeCommercialService {
  constructor(private readonly prisma: PrismaService) {}

  async upsertSalesLead(input: UpsertSalesLeadInput) {
    const tags = input.interestTopic ? ['lead_interesse'] : [];
    const leadPhone = input.leadPhone.trim();
    const existingContact = await this.prisma.jadeContact.findUnique({
      where: { leadPhone },
    });

    const mergedTags = Array.from(
      new Set([...(existingContact?.tags ?? []), ...tags].filter(Boolean)),
    );

    return this.prisma.jadeContact.upsert({
      where: { leadPhone },
      update: {
        leadName: input.leadName ?? existingContact?.leadName ?? null,
        isClient: input.isClient ?? existingContact?.isClient ?? false,
        clientId: input.clientId ?? existingContact?.clientId ?? null,
        salesMode: !(input.isClient ?? existingContact?.isClient ?? false),
        interestTopic: input.interestTopic ?? existingContact?.interestTopic ?? null,
        tags: mergedTags,
        notes: input.notes ?? existingContact?.notes ?? null,
        leadTemperature:
          existingContact?.leadTemperature ??
          (input.interestTopic ? 'warm' : 'cold'),
        commercialStatus:
          existingContact?.commercialStatus ??
          ((input.isClient ?? existingContact?.isClient ?? false)
            ? 'active'
            : 'lead_nurturing'),
        lastCommercialIntentAt: input.interestTopic ? new Date() : existingContact?.lastCommercialIntentAt ?? null,
      },
      create: {
        leadPhone,
        leadName: input.leadName ?? null,
        isClient: input.isClient ?? false,
        clientId: input.clientId ?? null,
        salesMode: !(input.isClient ?? false),
        interestTopic: input.interestTopic ?? null,
        tags: mergedTags,
        notes: input.notes ?? null,
        leadTemperature: input.interestTopic ? 'warm' : 'cold',
        commercialStatus: (input.isClient ?? false) ? 'active' : 'lead_nurturing',
        lastCommercialIntentAt: input.interestTopic ? new Date() : null,
      },
    });
  }

  async scheduleCommercialFollowUp(input: ScheduleCommercialFollowUpInput) {
    await this.upsertSalesLead({
      leadPhone: input.leadPhone,
      leadName: input.leadName,
      interestTopic: input.interestTopic,
      notes: input.reason,
    });

    return this.prisma.jadeFollowUpQueue.create({
      data: {
        leadPhone: input.leadPhone.trim(),
        leadName: input.leadName ?? null,
        isClient: false,
        reason: input.reason ?? 'lead_sem_conversao_imediata',
        status: 'pending',
        priority: 3,
        interestTopic: input.interestTopic ?? null,
        followUpStage: input.followUpStage ?? 'initial',
        offerType: input.offerType ?? 'discount_25',
        nextContactAt:
          input.nextContactAt ??
          new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });
  }

  async createHumanHandoff(input: CreateHumanHandoffInput) {
    await this.upsertSalesLead({
      leadPhone: input.leadPhone,
      leadName: input.leadName,
      interestTopic: input.interestTopic,
    });

    await this.prisma.jadeContact.update({
      where: { leadPhone: input.leadPhone.trim() },
      data: {
        commercialStatus: 'handoff_humano',
        leadTemperature: 'hot',
        lastCommercialIntentAt: new Date(),
      },
    });

    return this.prisma.jadeHumanHandoff.create({
      data: {
        leadPhone: input.leadPhone.trim(),
        leadName: input.leadName ?? null,
        reason: 'sales_interest',
        interestTopic: input.interestTopic ?? null,
        commercialIntent: input.commercialIntent ?? 'positive',
        sourceStage: input.sourceStage ?? 'sales_mode',
        assignedTo: input.assignedTo ?? 'Fabio',
        summary: input.summary ?? null,
        status: 'open',
      },
    });
  }

  async getClientCrossSellOpportunity(clientId: string) {
    const client = await this.prisma.client.findUnique({
      where: { id: clientId },
      include: {
        modules: {
          where: { enabled: true },
        },
        moduleItemAccesses: {
          where: { enabled: true },
          include: {
            item: true,
          },
        },
      },
    });

    if (!client) {
      throw new NotFoundException('Cliente nao encontrado para cross-sell da Jade.');
    }

    const activeModuleKeys = Array.from(
      new Set([
        ...client.modules.map((moduleRow) => moduleRow.moduleKey),
        ...client.moduleItemAccesses.map((itemAccess) => itemAccess.item.moduleKey),
      ]),
    );

    const nextModuleKey = selectCrossSellModule(activeModuleKeys);
    if (!nextModuleKey) {
      return null;
    }

    const nextModule = await this.prisma.moduleCatalog.findUnique({
      where: { key: nextModuleKey },
    });

    return {
      clientId: client.id,
      clientName: client.name,
      activeModuleKeys,
      nextModuleKey,
      nextModuleName: nextModule?.name ?? nextModuleKey,
      offerMessage: `Oi ${client.alertContactName}, vi que sua operacao ja usa parte das solucoes da Virtuagil. Neste mes estamos com condicao especial para adicionar o modulo ${nextModule?.name ?? nextModuleKey} com 25% de desconto em novo plano. Quer que eu te explique como funciona?`,
    };
  }
}
