import { Module } from '@nestjs/common';
import { AlertRulesController } from './alert-rules.controller';
import { AlertRulesService } from './alert-rules.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  // AlertRules gerencia regras configuraveis que o monitor usa para disparar alertas.
  imports: [AuthModule],
  controllers: [AlertRulesController],
  providers: [AlertRulesService],
})
export class AlertRulesModule {}
