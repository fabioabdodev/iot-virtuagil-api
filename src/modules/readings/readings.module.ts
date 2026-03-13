import { Module } from '@nestjs/common';
import { ReadingsController } from './readings.controller';
import { ReadingsService } from './readings.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  // Readings expone historico bruto e agregado das leituras para graficos e analises.
  imports: [AuthModule],
  controllers: [ReadingsController],
  providers: [ReadingsService],
})
export class ReadingsModule {}
