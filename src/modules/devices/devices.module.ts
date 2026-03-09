import { Module } from '@nestjs/common';
import { DevicesService } from './devices.service';
import { DevicesController } from './devices.controller';

@Module({
  // Este modulo concentra o CRUD de devices e a visao de dashboard usada pelo frontend.
  providers: [DevicesService],
  controllers: [DevicesController],
})
export class DevicesModule {}
