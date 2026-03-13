import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { AlertRulesService } from './alert-rules.service';
import { CreateAlertRuleDto } from './dto/create-alert-rule.dto';
import { UpdateAlertRuleDto } from './dto/update-alert-rule.dto';
import { CurrentUser, RequireModule } from '../auth/auth.decorators';
import { ModuleAccessGuard, SessionAuthGuard } from '../auth/auth.guards';
import { resolveScopedClientId } from '../auth/auth.scope';
import type { SessionUser } from '../auth/auth.types';

@Controller('alert-rules')
@UseGuards(SessionAuthGuard, ModuleAccessGuard)
@RequireModule('temperature')
export class AlertRulesController {
  constructor(private readonly alertRulesService: AlertRulesService) {}

  @Post()
  async create(@Body() dto: CreateAlertRuleDto, @CurrentUser() authUser: SessionUser) {
    dto.clientId = resolveScopedClientId(authUser, dto.clientId) ?? dto.clientId;
    return this.alertRulesService.create(dto);
  }

  @Get()
  async list(
    @Query('clientId') clientId?: string,
    @Query('deviceId') deviceId?: string,
    @Query('sensorType') sensorType?: string,
    @Query('enabled') enabled?: string,
    @CurrentUser() authUser?: SessionUser,
  ) {
    return this.alertRulesService.list({
      clientId: authUser ? resolveScopedClientId(authUser, clientId) : clientId,
      deviceId,
      sensorType,
      enabled: enabled == null ? undefined : enabled === 'true',
    });
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @CurrentUser() authUser?: SessionUser) {
    return this.alertRulesService.findOne(
      id,
      authUser ? resolveScopedClientId(authUser, undefined) : undefined,
    );
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateAlertRuleDto,
    @CurrentUser() authUser?: SessionUser,
  ) {
    const scopedClientId = authUser
      ? resolveScopedClientId(authUser, dto.clientId)
      : dto.clientId;
    dto.clientId = scopedClientId;
    return this.alertRulesService.update(id, dto, scopedClientId);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @CurrentUser() authUser?: SessionUser) {
    return this.alertRulesService.remove(
      id,
      authUser ? resolveScopedClientId(authUser, undefined) : undefined,
    );
  }
}
