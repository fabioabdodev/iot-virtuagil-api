import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ClientModulesService } from './client-modules.service';
import { UpsertClientModuleDto } from './dto/upsert-client-module.dto';
import { CurrentUser, RequireRole } from '../auth/auth.decorators';
import { RoleGuard, SessionAuthGuard } from '../auth/auth.guards';
import { resolveScopedClientId } from '../auth/auth.scope';
import type { SessionUser } from '../auth/auth.types';

@Controller('client-modules')
@UseGuards(SessionAuthGuard, RoleGuard)
@RequireRole('admin')
export class ClientModulesController {
  constructor(private readonly clientModulesService: ClientModulesService) {}

  @Get()
  async list(@Query('clientId') clientId?: string, @CurrentUser() authUser?: SessionUser) {
    return this.clientModulesService.list(
      authUser ? resolveScopedClientId(authUser, clientId) ?? '' : clientId ?? '',
    );
  }

  @Post()
  async upsert(@Body() dto: UpsertClientModuleDto, @CurrentUser() authUser: SessionUser) {
    dto.clientId = resolveScopedClientId(authUser, dto.clientId) ?? dto.clientId;
    return this.clientModulesService.upsert(dto);
  }
}
