import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  // Inicializa a aplicacao principal com todos os modulos registrados no AppModule.
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') ?? 3000;
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

  app.useLogger(loggerLevels[logLevel ?? 'info']);

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
      whitelist: true,              // remove campos extras
      forbidNonWhitelisted: true,   // dá erro se mandar campo extra
      transform: true,              // tenta converter tipos (string -> number)
    }),
  );

  // 0.0.0.0 e necessario para acesso externo quando a aplicacao roda em container.
  await app.listen(port, '0.0.0.0');
}
bootstrap();
