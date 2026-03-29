import { Module } from '@nestjs/common';

import { PrismaModule } from '../../prisma/prisma.module';
import { JadeCommercialService } from './jade-commercial.service';

@Module({
  imports: [PrismaModule],
  providers: [JadeCommercialService],
  exports: [JadeCommercialService],
})
export class JadeCommercialModule {}
