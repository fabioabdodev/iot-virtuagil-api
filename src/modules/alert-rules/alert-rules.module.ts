import { Module } from '@nestjs/common';
import { AlertRulesController } from './alert-rules.controller';
import { AlertRulesService } from './alert-rules.service';

@Module({
  // AlertRules gerencia regras configuraveis que o monitor usa para disparar alertas.
  controllers: [AlertRulesController],
  providers: [AlertRulesService],
})
export class AlertRulesModule {}
