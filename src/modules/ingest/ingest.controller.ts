import { Body, Controller, Post } from '@nestjs/common';
import { IngestService } from './ingest.service';
import { TemperatureDto } from './dto/temperature.dto';

@Controller('iot') // mantém a URL antiga: /iot/temperature
export class IngestController {
  constructor(private ingest: IngestService) {}

  @Post('temperature')
  async temperature(@Body() body: TemperatureDto) {
    await this.ingest.ingestTemperature(body);
    return { ok: true };
  }
}
