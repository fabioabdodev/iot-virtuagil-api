import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { IngestModule } from './modules/ingest/ingest.module';
import { MonitorModule } from './modules/monitor/monitor.module';
import { DevicesModule } from './modules/devices/devices.module';
import { ReadingsModule } from './modules/readings/readings.module';
import { ClientsModule } from './modules/clients/clients.module';
import { AlertRulesModule } from './modules/alert-rules/alert-rules.module';
import { ActuatorsModule } from './modules/actuators/actuators.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { validateEnv } from './config/env';
import { InfraModule } from './infra/infra.module';

@Module({
  imports: [
    // Le e valida as variaveis de ambiente antes de qualquer modulo depender delas.
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
    }),
    // Infra agrupa componentes compartilhados, como cache e entrega de alertas.
    InfraModule,
    // Scheduler habilita tarefas recorrentes usadas pelo monitoramento dos devices.
    ScheduleModule.forRoot(),
    PrismaModule,
    IngestModule,
    MonitorModule,
    DevicesModule,
    ReadingsModule,
    ClientsModule,
    AlertRulesModule,
    ActuatorsModule,
    AuthModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
