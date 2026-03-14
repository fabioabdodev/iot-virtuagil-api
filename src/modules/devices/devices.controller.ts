import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { DevicesService } from './devices.service';
import { UpdateDeviceDto } from './dto/update-device.dto';
import { CreateDeviceDto } from './dto/create-device.dto';
import { CurrentUser, RequireModule } from '../auth/auth.decorators';
import { ModuleAccessGuard, SessionAuthGuard } from '../auth/auth.guards';
import type { SessionUser } from '../auth/auth.types';
import { resolveScopedClientId } from '../auth/auth.scope';
import {
  assertPlatformAdmin,
  assertTenantOrPlatformAdmin,
  isPlatformAdmin,
  isTenantAdmin,
} from '../auth/auth.permissions';

@Controller('devices')
@UseGuards(SessionAuthGuard, ModuleAccessGuard)
@RequireModule('temperature')
export class DevicesController {
  constructor(private service: DevicesService) {}

  @Post()
  async createDevice(@Body() dto: CreateDeviceDto, @CurrentUser() authUser: SessionUser) {
    // Cria o cadastro base do device antes que ele comece a enviar leitura.
    assertPlatformAdmin(authUser, 'Only platform admin can create devices');
    dto.clientId = resolveScopedClientId(authUser, dto.clientId);
    return this.service.create(dto);
  }

  @Get()
  async listDevices(
    @Query('clientId') clientId?: string,
    @Query('limit') limit?: string,
    @CurrentUser() authUser?: SessionUser,
  ) {
    // Este endpoint alimenta o dashboard principal com resumo do estado atual de cada device.
    const parsedLimit = limit ? Number(limit) : undefined;
    return this.service.listForDashboard(
      authUser ? resolveScopedClientId(authUser, clientId) : clientId,
      parsedLimit,
    );
  }

  @Get(':id')
  async getDevice(
    @Param('id') id: string,
    @Query('clientId') clientId?: string,
    @CurrentUser() authUser?: SessionUser,
  ) {
    // Quando ha clientId, o service valida se o device realmente pertence ao tenant informado.
    return this.service.findOne(
      id,
      authUser ? resolveScopedClientId(authUser, clientId) : clientId,
    );
  }

  @Get(':id/readings')
  async getDeviceReadings(
    @Param('id') id: string,
    @Query('limit') limit?: string,
    @Query('clientId') clientId?: string,
    @CurrentUser() authUser?: SessionUser,
  ) {
    // Historico direto do device para paines laterais e consultas rapidas do dashboard.
    const parsedLimit = limit ? Number(limit) : undefined;
    return this.service.getTemperatureHistory(
      id,
      parsedLimit,
      authUser ? resolveScopedClientId(authUser, clientId) : clientId,
    );
  }

  // patch is used to change configuration such as temperature limits
  @Patch(':id')
  async updateDevice(
    @Param('id') id: string,
    @Body() dto: UpdateDeviceDto,
    @Query('clientId') clientId?: string,
    @CurrentUser() authUser?: SessionUser,
  ) {
    assertTenantOrPlatformAdmin(
      authUser,
      'Only admin can update device temperature settings',
    );

    const scopedClientId = authUser
      ? resolveScopedClientId(authUser, clientId ?? dto.clientId)
      : clientId;

    if (authUser && isTenantAdmin(authUser)) {
      const hasStructuralFields =
        dto.clientId !== undefined ||
        dto.name !== undefined ||
        dto.location !== undefined;

      if (hasStructuralFields) {
        throw new ForbiddenException(
          'Client admin can only update temperature bounds on devices',
        );
      }
    }

    return this.service.update(id, dto, scopedClientId, {
      actor: authUser,
      allowCreateIfMissing: authUser ? isPlatformAdmin(authUser) : true,
      restrictToTemperatureBounds: authUser ? isTenantAdmin(authUser) : false,
    });
  }

  @Delete(':id')
  async deleteDevice(
    @Param('id') id: string,
    @Query('clientId') clientId?: string,
    @CurrentUser() authUser?: SessionUser,
  ) {
    // A exclusao passa pelo service para garantir validacao de tenant e limpeza de cache.
    assertPlatformAdmin(authUser, 'Only platform admin can delete devices');
    return this.service.remove(
      id,
      authUser ? resolveScopedClientId(authUser, clientId) : clientId,
    );
  }
}
