import { Module } from '@nestjs/common';
import { ReadingsController } from './readings.controller';
import { ReadingsService } from './readings.service';

@Module({
  // Readings expone historico bruto e agregado das leituras para graficos e analises.
  controllers: [ReadingsController],
  providers: [ReadingsService],
})
export class ReadingsModule {}
