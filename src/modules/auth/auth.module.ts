import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ModuleAccessGuard, RoleGuard, SessionAuthGuard } from './auth.guards';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AuthController],
  providers: [AuthService, SessionAuthGuard, RoleGuard, ModuleAccessGuard],
  exports: [AuthService, SessionAuthGuard, RoleGuard, ModuleAccessGuard],
})
export class AuthModule {}
