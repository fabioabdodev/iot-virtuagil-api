import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ActuatorsService } from './actuators.service';
import { CreateActuatorDto } from './dto/create-actuator.dto';
import { UpdateActuatorDto } from './dto/update-actuator.dto';
import { CreateActuationCommandDto } from './dto/create-actuation-command.dto';
import { CurrentUser, RequireModule } from '../auth/auth.decorators';
import { ModuleAccessGuard, SessionAuthGuard } from '../auth/auth.guards';
import { resolveScopedClientId } from '../auth/auth.scope';
import type { SessionUser } from '../auth/auth.types';

@Controller('actuators')
@UseGuards(SessionAuthGuard, ModuleAccessGuard)
@RequireModule('actuation')
export class ActuatorsController {
  constructor(private readonly actuatorsService: ActuatorsService) {}

  @Post()
  async create(@Body() dto: CreateActuatorDto, @CurrentUser() authUser: SessionUser) {
    dto.clientId = resolveScopedClientId(authUser, dto.clientId) ?? dto.clientId;
    return this.actuatorsService.create(dto);
  }

  @Get()
  async list(
    @Query('clientId') clientId?: string,
    @Query('deviceId') deviceId?: string,
    @Query('state') state?: string,
    @CurrentUser() authUser?: SessionUser,
  ) {
    return this.actuatorsService.list({
      clientId: authUser ? resolveScopedClientId(authUser, clientId) : clientId,
      deviceId,
      state,
    });
  }

  @Get('commands/recent')
  async listRecentCommands(
    @Query('clientId') clientId?: string,
    @Query('limit') limit?: string,
    @CurrentUser() authUser?: SessionUser,
  ) {
    const parsedLimit = limit ? Number(limit) : undefined;
    return this.actuatorsService.listRecentCommands(
      parsedLimit,
      authUser ? resolveScopedClientId(authUser, clientId) : clientId,
    );
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Query('clientId') clientId?: string,
    @CurrentUser() authUser?: SessionUser,
  ) {
    return this.actuatorsService.findOne(
      id,
      authUser ? resolveScopedClientId(authUser, clientId) : clientId,
    );
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateActuatorDto,
    @CurrentUser() authUser?: SessionUser,
  ) {
    const scopedClientId = authUser
      ? resolveScopedClientId(authUser, dto.clientId)
      : dto.clientId;
    dto.clientId = scopedClientId;
    return this.actuatorsService.update(id, dto, scopedClientId);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @CurrentUser() authUser?: SessionUser) {
    return this.actuatorsService.remove(
      id,
      authUser ? resolveScopedClientId(authUser, undefined) : undefined,
    );
  }

  @Get(':id/commands')
  async listCommands(
    @Param('id') id: string,
    @Query('limit') limit?: string,
    @CurrentUser() authUser?: SessionUser,
  ) {
    const parsedLimit = limit ? Number(limit) : undefined;
    return this.actuatorsService.listCommands(
      id,
      parsedLimit,
      authUser ? resolveScopedClientId(authUser, undefined) : undefined,
    );
  }

  @Post(':id/commands')
  async createCommand(
    @Param('id') id: string,
    @Body() dto: CreateActuationCommandDto,
    @CurrentUser() authUser?: SessionUser,
  ) {
    return this.actuatorsService.createCommand(
      id,
      dto,
      authUser ? resolveScopedClientId(authUser, undefined) : undefined,
    );
  }
}
