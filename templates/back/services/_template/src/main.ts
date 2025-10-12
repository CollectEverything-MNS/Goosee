import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import 'reflect-metadata';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const nodeEnv = configService.get<string>('NODE_ENV') ?? 'development';
  const port = configService.get<number>('PORT') ?? 3000;

  if (nodeEnv === 'development') {
    app.useLogger(['log', 'error', 'warn', 'debug', 'verbose']);
  } else {
    app.useLogger(['error', 'warn']);
  }

  await app.listen(port);

  const logger = new Logger('Bootstrap');
  if (nodeEnv === 'development') {
    logger.log(
      `🚀 App running in DEVELOPMENT mode at http://localhost:${port}`,
    );
  } else {
    logger.log(
      `✅ App running in ${nodeEnv.toUpperCase()} mode on port ${port}`,
    );
  }
}
bootstrap();
