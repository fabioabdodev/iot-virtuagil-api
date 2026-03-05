import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class MonitorService {

  private readonly logger = new Logger(MonitorService.name);

  constructor(private prisma: PrismaService) {}

@Cron('*/1 * * * *')
async checkOfflineDevices() {
  this.logger.log('cron rodou');

  const minutesOffline = 5; // em produção: 5 minutos
  const cutoff = new Date(Date.now() - minutesOffline * 60 * 1000);

  // Buscar devices que passaram do cutoff e ainda não foram marcados como offline
  const offlineCandidates = await this.prisma.device.findMany({
    where: {
      AND: [
        { isOffline: false }, // só devices que ainda estão marcados como online
        {
          OR: [
            { lastSeen: null },
            { lastSeen: { lt: cutoff } }
          ]
        }
      ]
    },
  });

  const allDevices = await this.prisma.device.findMany({ orderBy: { id: 'asc' } });

  this.logger.log(
    `devices: ${allDevices
      .map((d) => `${d.id} lastSeen=${d.lastSeen ? d.lastSeen.toISOString() : 'null'} isOffline=${d.isOffline}`)
      .join(' | ')}`,
  );

  this.logger.log(`cutoff=${cutoff.toISOString()}`);
  this.logger.log(`offlineCandidates=${offlineCandidates.length}`);

  // Para cada device offline, marcar como offline e alertar (apenas 1x por transição)
  for (const device of offlineCandidates) {
    await this.prisma.device.update({
      where: { id: device.id },
      data: {
        isOffline: true,
        offlineSince: new Date(),
        lastAlertAt: new Date(),
      },
    });

    this.logger.warn(`Device ${device.id} ficou OFFLINE!`);

    // TODO: implementar webhook n8n quando N8N_OFFLINE_WEBHOOK_URL estiver configurado
  }
}
}
