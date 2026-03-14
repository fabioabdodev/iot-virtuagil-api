import { ForbiddenException } from '@nestjs/common';
import type { SessionUser } from './auth.types';

export function isAdminUser(authUser?: SessionUser | null) {
  return authUser?.role === 'admin';
}

export function isPlatformAdmin(authUser?: SessionUser | null) {
  return isAdminUser(authUser) && !authUser?.clientId;
}

export function isTenantAdmin(authUser?: SessionUser | null) {
  return isAdminUser(authUser) && Boolean(authUser?.clientId);
}

export function assertAdminUser(
  authUser?: SessionUser | null,
  message = 'Only admin can perform this action',
) {
  if (!isAdminUser(authUser)) {
    throw new ForbiddenException(message);
  }
}

export function assertPlatformAdmin(
  authUser?: SessionUser | null,
  message = 'Only platform admin can perform this action',
) {
  if (!isPlatformAdmin(authUser)) {
    throw new ForbiddenException(message);
  }
}

export function assertTenantOrPlatformAdmin(
  authUser?: SessionUser | null,
  message = 'Only admin can perform this action',
) {
  if (!isPlatformAdmin(authUser) && !isTenantAdmin(authUser)) {
    throw new ForbiddenException(message);
  }
}
