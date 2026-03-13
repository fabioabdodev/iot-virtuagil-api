import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CurrentUser, RequireRole } from '../auth/auth.decorators';
import { RoleGuard, SessionAuthGuard } from '../auth/auth.guards';
import { resolveScopedClientId } from '../auth/auth.scope';
import type { SessionUser } from '../auth/auth.types';

@Controller('users')
@UseGuards(SessionAuthGuard, RoleGuard)
@RequireRole('admin')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(@Body() dto: CreateUserDto, @CurrentUser() authUser: SessionUser) {
    dto.clientId = resolveScopedClientId(authUser, dto.clientId) ?? dto.clientId;
    return this.usersService.create(dto);
  }

  @Get()
  async list(@Query('clientId') clientId?: string, @CurrentUser() authUser?: SessionUser) {
    return this.usersService.list(
      authUser ? resolveScopedClientId(authUser, clientId) : clientId,
    );
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @CurrentUser() authUser?: SessionUser) {
    return this.usersService.findOne(
      id,
      authUser ? resolveScopedClientId(authUser, undefined) : undefined,
    );
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
    @CurrentUser() authUser?: SessionUser,
  ) {
    const scopedClientId = authUser
      ? resolveScopedClientId(authUser, dto.clientId)
      : dto.clientId;
    dto.clientId = scopedClientId;
    return this.usersService.update(id, dto, scopedClientId);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @CurrentUser() authUser?: SessionUser) {
    return this.usersService.remove(
      id,
      authUser ? resolveScopedClientId(authUser, undefined) : undefined,
    );
  }
}
