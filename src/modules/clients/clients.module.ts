import { Module } from '@nestjs/common';
import { ClientsController } from './clients.controller';
import { ClientsService } from './clients.service';

@Module({
  // Clients centraliza o cadastro dos tenants que agrupam devices e regras de alerta.
  controllers: [ClientsController],
  providers: [ClientsService],
})
export class ClientsModule {}
