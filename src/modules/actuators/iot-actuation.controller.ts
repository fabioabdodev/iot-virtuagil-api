import {
  Controller,
  Get,
  Headers,
  Logger,
  Query,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ActuatorsService } from './actuators.service';

@Controller('iot/actuators')
export class IotActuationController {
  private readonly logger = new Logger(IotActuationController.name);

  constructor(
    private readonly actuatorsService: ActuatorsService,
    private readonly configService: ConfigService,
  ) {}

  @Get()
  async listByDevice(
    @Headers('x-device-key') deviceKey: string | undefined,
    @Query('deviceId') deviceId?: string,
  ) {
    const expectedKey = this.configService.get<string>('DEVICE_API_KEY');

    if (!expectedKey || !deviceKey || deviceKey !== expectedKey) {
      this.logger.warn(
        `Unauthorized actuation polling for deviceId=${deviceId ?? 'missing'}`,
      );
      throw new UnauthorizedException('Invalid device key');
    }

    if (!deviceId) {
      return [];
    }

    return this.actuatorsService.listForRuntime(deviceId);
  }
}
