import { Global, Module } from '@nestjs/common';
import { CacheService } from './cache/cache.service';
import { AlertDeliveryQueueService } from './alerts/alert-delivery-queue.service';
import { AuditTrailService } from './audit/audit-trail.service';

@Global()
@Module({
  providers: [CacheService, AlertDeliveryQueueService, AuditTrailService],
  exports: [CacheService, AlertDeliveryQueueService, AuditTrailService],
})
export class InfraModule {}
