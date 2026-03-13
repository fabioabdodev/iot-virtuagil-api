import { Module } from '@nestjs/common';
import { ActuatorsController } from './actuators.controller';
import { ActuatorsService } from './actuators.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  // Actuators concentra o modulo inicial de acionamento manual e historico basico.
  imports: [AuthModule],
  controllers: [ActuatorsController],
  providers: [ActuatorsService],
})
export class ActuatorsModule {}
