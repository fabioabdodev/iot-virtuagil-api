import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthService } from './auth.service';
import { PrismaService } from '../../prisma/prisma.service';
import { REQUIRE_MODULE_KEY, REQUIRE_ROLE_KEY } from './auth.decorators';

const MODULE_ALIASES: Record<string, 'ambiental' | 'acionamento' | 'energia'> = {
  ambiental: 'ambiental',
  temperature: 'ambiental',
  acionamento: 'acionamento',
  actuation: 'acionamento',
  energia: 'energia',
};

@Injectable()
export class SessionAuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const authorization = request.headers.authorization as string | undefined;
    const authUser = await this.authService.authenticateFromAuthorization(authorization);
    request.authUser = authUser;
    return true;
  }
}

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext) {
    const requiredRole = this.reflector.getAllAndOverride<'admin' | 'operator'>(
      REQUIRE_ROLE_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRole) return true;

    const request = context.switchToHttp().getRequest();
    const authUser = request.authUser as { role?: string } | undefined;
    if (!authUser?.role) {
      throw new UnauthorizedException('Missing authenticated user');
    }

    if (authUser.role !== requiredRole) {
      throw new ForbiddenException('Insufficient role for this action');
    }

    return true;
  }
}

@Injectable()
export class ModuleAccessGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext) {
    const requiredModule = this.reflector.getAllAndOverride<
      'ambiental' | 'acionamento' | 'energia' | 'temperature' | 'actuation'
    >(REQUIRE_MODULE_KEY, [context.getHandler(), context.getClass()]);

    if (!requiredModule) return true;

    const normalizedModule = MODULE_ALIASES[requiredModule];
    if (!normalizedModule) {
      throw new ForbiddenException(`Module ${requiredModule} is not supported`);
    }

    const request = context.switchToHttp().getRequest();
    const authUser = request.authUser as { clientId?: string | null } | undefined;
    if (!authUser) {
      throw new UnauthorizedException('Missing authenticated user');
    }

    if (!authUser.clientId) {
      return true;
    }

    const legacyModuleKey =
      normalizedModule === 'ambiental'
        ? 'temperature'
        : normalizedModule === 'acionamento'
          ? 'actuation'
          : null;

    if (legacyModuleKey) {
      const legacyRow = await this.prisma.clientModule.findUnique({
        where: {
          clientId_moduleKey: {
            clientId: authUser.clientId,
            moduleKey: legacyModuleKey,
          },
        },
      } as any);

      if (legacyRow?.enabled) {
        return true;
      }
    }

    const enabledItemCount = await this.prisma.clientModuleItem.count({
      where: {
        clientId: authUser.clientId,
        enabled: true,
        item: {
          moduleKey: normalizedModule,
        },
      },
    } as any);

    if (enabledItemCount <= 0) {
      throw new ForbiddenException(
        `Module ${normalizedModule} is not enabled for this client`,
      );
    }

    // Compatibilidade transitoria: se itens estao ativos, mantemos a linha legado sincronizada.
    if (legacyModuleKey) {
      await this.prisma.clientModule.upsert({
        where: {
          clientId_moduleKey: {
            clientId: authUser.clientId,
            moduleKey: legacyModuleKey,
          },
        },
        update: { enabled: true },
        create: {
          clientId: authUser.clientId,
          moduleKey: legacyModuleKey,
          enabled: true,
        },
      } as any);
    }

    return true;
  }
}
