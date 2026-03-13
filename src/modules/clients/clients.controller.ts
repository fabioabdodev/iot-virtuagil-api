import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards, ForbiddenException } from '@nestjs/common';
import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { CurrentUser, RequireRole } from '../auth/auth.decorators';
import { RoleGuard, SessionAuthGuard } from '../auth/auth.guards';
import type { SessionUser } from '../auth/auth.types';

@Controller('clients')
@UseGuards(SessionAuthGuard, RoleGuard)
@RequireRole('admin')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Post()
  async create(@Body() dto: CreateClientDto, @CurrentUser() authUser: SessionUser) {
    if (authUser.clientId) {
      throw new ForbiddenException('Only platform admin can create clients');
    }
    return this.clientsService.create(dto);
  }

  @Get()
  async list(@CurrentUser() authUser: SessionUser) {
    return authUser.clientId
      ? [await this.clientsService.findOne(authUser.clientId)]
      : this.clientsService.list();
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @CurrentUser() authUser: SessionUser) {
    return this.clientsService.findOne(authUser.clientId ?? id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateClientDto,
    @CurrentUser() authUser: SessionUser,
  ) {
    return this.clientsService.update(authUser.clientId ?? id, dto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @CurrentUser() authUser: SessionUser) {
    if (authUser.clientId) {
      throw new ForbiddenException('Only platform admin can remove clients');
    }
    return this.clientsService.remove(id);
  }
}
