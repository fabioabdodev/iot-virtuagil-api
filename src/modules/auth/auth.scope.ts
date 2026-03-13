import { ForbiddenException } from '@nestjs/common';
import { SessionUser } from './auth.types';

export function resolveScopedClientId(
  authUser: SessionUser,
  requestedClientId?: string | null,
) {
  if (authUser.clientId && requestedClientId && requestedClientId !== authUser.clientId) {
    throw new ForbiddenException('clientId does not match authenticated session');
  }

  return authUser.clientId ?? requestedClientId ?? undefined;
}
