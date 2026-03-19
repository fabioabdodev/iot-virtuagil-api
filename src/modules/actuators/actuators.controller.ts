import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ActuatorsService } from './actuators.service';
import { CreateActuatorDto } from './dto/create-actuator.dto';
import { UpdateActuatorDto } from './dto/update-actuator.dto';
import { CreateActuationCommandDto } from './dto/create-actuation-command.dto';
import { CreateActuationScheduleDto } from './dto/create-actuation-schedule.dto';
import { UpdateActuationScheduleDto } from './dto/update-actuation-schedule.dto';
import { CurrentUser, RequireModule, RequireRole } from '../auth/auth.decorators';
import { ModuleAccessGuard, RoleGuard, SessionAuthGuard } from '../auth/auth.guards';
import { resolveScopedClientId } from '../auth/auth.scope';
import type { SessionUser } from '../auth/auth.types';
import { assertPlatformAdmin } from '../auth/auth.permissions';
import { ActuationSchedulesService } from './actuation-schedules.service';

@Controller('actuators')
@UseGuards(SessionAuthGuard, RoleGuard, ModuleAccessGuard)
@RequireModule('acionamento')
export class ActuatorsController {
  constructor(
    private readonly actuatorsService: ActuatorsService,
    private readonly actuationSchedulesService: ActuationSchedulesService,
  ) {}

  @Post()
  @RequireRole('admin')
  async create(@Body() dto: CreateActuatorDto, @CurrentUser() authUser: SessionUser) {
    assertPlatformAdmin(authUser, 'Only platform admin can create actuators');
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

  @Get('schedules')
  async listSchedules(
    @Query('clientId') clientId?: string,
    @Query('actuatorId') actuatorId?: string,
    @Query('enabled') enabled?: string,
    @CurrentUser() authUser?: SessionUser,
  ) {
    return this.actuationSchedulesService.list({
      clientId: authUser ? resolveScopedClientId(authUser, clientId) : clientId,
      actuatorId,
      enabled: enabled == null ? undefined : enabled === 'true',
    });
  }

  @Post('schedules')
  @RequireRole('admin')
  async createSchedule(
    @Body() dto: CreateActuationScheduleDto,
    @CurrentUser() authUser?: SessionUser,
  ) {
    dto.clientId = authUser
      ? resolveScopedClientId(authUser, dto.clientId) ?? dto.clientId
      : dto.clientId;
    return this.actuationSchedulesService.create(dto, authUser);
  }

  @Patch('schedules/:id')
  @RequireRole('admin')
  async updateSchedule(
    @Param('id') id: string,
    @Body() dto: UpdateActuationScheduleDto,
    @CurrentUser() authUser?: SessionUser,
  ) {
    const scopedClientId = authUser
      ? resolveScopedClientId(authUser, dto.clientId)
      : dto.clientId;
    dto.clientId = scopedClientId;
    return this.actuationSchedulesService.update(id, dto, scopedClientId, authUser);
  }

  @Delete('schedules/:id')
  @RequireRole('admin')
  async removeSchedule(
    @Param('id') id: string,
    @CurrentUser() authUser?: SessionUser,
  ) {
    return this.actuationSchedulesService.remove(
      id,
      authUser ? resolveScopedClientId(authUser, undefined) : undefined,
      authUser,
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
  @RequireRole('admin')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateActuatorDto,
    @CurrentUser() authUser?: SessionUser,
  ) {
    assertPlatformAdmin(authUser, 'Only platform admin can edit actuators');
    const scopedClientId = authUser
      ? resolveScopedClientId(authUser, dto.clientId)
      : dto.clientId;
    dto.clientId = scopedClientId;
    return this.actuatorsService.update(id, dto, scopedClientId);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @CurrentUser() authUser?: SessionUser) {
    assertPlatformAdmin(authUser, 'Only platform admin can delete actuators');
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
  @RequireRole('admin')
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
