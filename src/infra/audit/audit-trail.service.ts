import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import type { SessionUser } from '../../modules/auth/auth.types';

type AuditEntryInput = {
  clientId?: string | null;
  entityType: string;
  entityId: string;
  action: string;
  fieldName?: string | null;
  previousValue?: Prisma.InputJsonValue | null;
  nextValue?: Prisma.InputJsonValue | null;
  actor?: SessionUser | null;
};

@Injectable()
export class AuditTrailService {
  private readonly logger = new Logger(AuditTrailService.name);

  constructor(private readonly prisma: PrismaService) {}

  async record(entry: AuditEntryInput) {
    try {
      await this.prisma.auditLog.create({
        data: {
          clientId: entry.clientId ?? null,
          entityType: entry.entityType,
          entityId: entry.entityId,
          action: entry.action,
          fieldName: entry.fieldName ?? null,
          previousValue: entry.previousValue ?? Prisma.JsonNull,
          nextValue: entry.nextValue ?? Prisma.JsonNull,
          actorUserId: entry.actor?.id ?? null,
          actorEmail: entry.actor?.email ?? null,
          actorRole: entry.actor?.role ?? null,
          actorClientId: entry.actor?.clientId ?? null,
        } as any,
      });
    } catch (error) {
      this.logger.warn(
        `Failed to persist audit entry entity=${entry.entityType} id=${entry.entityId}: ${(error as Error).message}`,
      );
    }
  }
}
