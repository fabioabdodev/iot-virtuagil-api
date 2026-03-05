import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TemperatureDto } from './dto/temperature.dto';

@Injectable()
export class IngestService {
  constructor(private prisma: PrismaService) {}

  async ingestTemperature(body: TemperatureDto) {
    await this.prisma.temperatureLog.create({
      data: {
        deviceId: body.device_id,
        temperature: body.temperature,
      },
    });

    await this.prisma.device.upsert({
      where: { id: body.device_id },
      update: {
        lastSeen: new Date(),
        isOffline: false,
        offlineSince: null,
      },
      create: {
        id: body.device_id,
        lastSeen: new Date(),
        isOffline: false,
      },
    });
  }
}
