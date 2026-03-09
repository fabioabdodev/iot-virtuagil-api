import { Module } from '@nestjs/common';
import { MonitorService } from './monitor.service';

@Module({
  // Monitor executa rotinas agendadas para offline e alertas de temperatura.
  providers: [MonitorService],
})
export class MonitorModule {}
