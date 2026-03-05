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

  const minutesOffline = 1;
  const cutoff = new Date(Date.now() - minutesOffline * 60 * 1000);

  const offline = await this.prisma.device.findMany({
    where: {
      OR: [{ lastSeen: null }, { lastSeen: { lt: cutoff } }],
    },
  });

  const allDevices = await this.prisma.device.findMany({ orderBy: { id: 'asc' } });

  this.logger.log(
    `devices: ${allDevices
      .map((d) => `${d.id} lastSeen=${d.lastSeen ? d.lastSeen.toISOString() : 'null'}`)
      .join(' | ')}`,
  );

  this.logger.log(`cutoff=${cutoff.toISOString()}`);
  this.logger.log(`offlineFound=${offline.length}`);

  if (offline.length > 0) {
    this.logger.warn(`Devices offline: ${offline.map((d) => d.id).join(', ')}`);
  }
}
}
