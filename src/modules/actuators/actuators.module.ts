import { Module } from '@nestjs/common';
import { ActuatorsController } from './actuators.controller';
import { ActuatorsService } from './actuators.service';
import { AuthModule } from '../auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { IotActuationController } from './iot-actuation.controller';

@Module({
  // Actuators concentra o modulo inicial de acionamento manual e historico basico.
  imports: [AuthModule, ConfigModule],
  controllers: [ActuatorsController, IotActuationController],
  providers: [ActuatorsService],
})
export class ActuatorsModule {}
