import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  // Inicializa a aplicacao principal com todos os modulos registrados no AppModule.
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') ?? 3000;
  const corsOriginsValue = configService.get<string>('CORS_ORIGINS');
  const logLevel = configService.get<'debug' | 'info' | 'warn' | 'error'>(
    'LOG_LEVEL',
  );
  const loggerLevels: Record<
    'debug' | 'info' | 'warn' | 'error',
    Array<'debug' | 'log' | 'warn' | 'error'>
  > = {
    debug: ['debug', 'log', 'warn', 'error'],
    info: ['log', 'warn', 'error'],
    warn: ['warn', 'error'],
    error: ['error'],
  };
  const httpLogger = new Logger('HTTP');
  const allowedOrigins =
    corsOriginsValue?.split(',').map((origin) => origin.trim()).filter(Boolean) ?? [
      'http://localhost:3000',
      'http://localhost:3001',
      'https://monitor.virtuagil.com.br',
    ];

  app.useLogger(loggerLevels[logLevel ?? 'info']);

  // O dashboard web roda em outro subdominio, entao a API precisa liberar CORS explicitamente.
  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });

  app.use((req, res, next) => {
    const startedAt = Date.now();

    res.on('finish', () => {
      const elapsedMs = Date.now() - startedAt;
      httpLogger.log(
        `${req.method} ${req.originalUrl} status=${res.statusCode} durationMs=${elapsedMs}`,
      );
    });

    next();
  });

  // Esse pipe protege a API contra payloads inesperados e converte tipos basicos automaticamente.
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // 0.0.0.0 e necessario para acesso externo quando a aplicacao roda em container.
  await app.listen(port, '0.0.0.0');
}
void bootstrap();
