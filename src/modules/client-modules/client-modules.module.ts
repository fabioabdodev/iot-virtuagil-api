import { Module } from '@nestjs/common';
import { ClientModulesController } from './client-modules.controller';
import { ClientModulesService } from './client-modules.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [ClientModulesController],
  providers: [ClientModulesService],
})
export class ClientModulesModule {}
