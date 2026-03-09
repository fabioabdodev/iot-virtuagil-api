import {
  Body,
  Controller,
  Headers,
  HttpCode,
  Logger,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IngestService } from './ingest.service';
import { TemperatureDto } from './dto/temperature.dto';

@Controller('iot') // mantém a URL antiga: /iot/temperature
export class IngestController {
  private readonly logger = new Logger(IngestController.name);

  constructor(
    private readonly ingest: IngestService,
    private readonly configService: ConfigService,
  ) {}

  @Post('temperature')
  @HttpCode(200)
  async temperature(
    @Headers('x-device-key') deviceKey: string | undefined,
    @Body() body: TemperatureDto,
  ) {
    const expectedKey = this.configService.get<string>('DEVICE_API_KEY');

    if (!expectedKey || !deviceKey || deviceKey !== expectedKey) {
      this.logger.warn(
        `Unauthorized ingest attempt for device_id=${body.device_id}`,
      );
      throw new UnauthorizedException('Invalid device key');
    }

    this.logger.log(
      `Accepted ingest for device_id=${body.device_id} temperature=${body.temperature}`,
    );
    await this.ingest.ingestTemperature(body);
    return { ok: true };
  }
}
