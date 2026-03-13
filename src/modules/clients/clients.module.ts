import { Module } from '@nestjs/common';
import { ClientsController } from './clients.controller';
import { ClientsService } from './clients.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  // Clients centraliza o cadastro dos tenants que agrupam devices e regras de alerta.
  imports: [AuthModule],
  controllers: [ClientsController],
  providers: [ClientsService],
})
export class ClientsModule {}
