import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ReadingsService } from './readings.service';
import { CurrentUser, RequireModule } from '../auth/auth.decorators';
import { ModuleAccessGuard, SessionAuthGuard } from '../auth/auth.guards';
import { resolveScopedClientId } from '../auth/auth.scope';
import type { SessionUser } from '../auth/auth.types';

@Controller('readings')
@UseGuards(SessionAuthGuard, ModuleAccessGuard)
@RequireModule('temperature')
export class ReadingsController {
  constructor(private readonly readingsService: ReadingsService) {}

  @Get(':deviceId')
  async listByDevice(
    @Param('deviceId') deviceId: string,
    @Query('clientId') clientId?: string,
    @Query('sensor') sensor?: string,
    @Query('limit') limit?: string,
    @Query('resolution') resolution?: string,
    @CurrentUser() authUser?: SessionUser,
  ) {
    const parsedLimit = limit ? Number(limit) : undefined;
    return this.readingsService.listByDevice(
      deviceId,
      authUser ? resolveScopedClientId(authUser, clientId) : clientId,
      sensor ?? 'temperature',
      parsedLimit,
      resolution,
    );
  }
}
