import { createParamDecorator, ExecutionContext, SetMetadata } from '@nestjs/common';
import { SessionUser } from './auth.types';

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): SessionUser | undefined => {
    const request = ctx.switchToHttp().getRequest();
    return request.authUser as SessionUser | undefined;
  },
);

export const REQUIRE_ROLE_KEY = 'require_role';
export const REQUIRE_MODULE_KEY = 'require_module';

export const RequireRole = (role: 'admin' | 'operator') =>
  SetMetadata(REQUIRE_ROLE_KEY, role);

export const RequireModule = (moduleKey: 'temperature' | 'actuation') =>
  SetMetadata(REQUIRE_MODULE_KEY, moduleKey);
