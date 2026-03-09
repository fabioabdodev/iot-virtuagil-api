import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { IngestController } from './ingest.controller';
import { IngestService } from './ingest.service';

@Module({
  // Ingest recebe leituras dos dispositivos e precisa do ConfigModule por causa da chave de ingestao.
  imports: [ConfigModule],
  controllers: [IngestController],
  providers: [IngestService]
})
export class IngestModule {}
