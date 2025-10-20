import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  const nodeEnv = configService.get<string>('NODE_ENV', 'development');
  const port = configService.get<number>('API_GATEWAY_PORT', 3001);

  if (nodeEnv === 'development') {
    app.useLogger(['log', 'error', 'warn', 'debug', 'verbose']);
  } else {
    app.useLogger(['error', 'warn']);
  }

  await app.listen(port);

  const logger = new Logger('Bootstrap');
  logger.log('=================================================');
  logger.log(`🚀 API Gateway running in ${nodeEnv.toUpperCase()} mode`);
  logger.log(`🌐 HTTP: http://localhost:${port}`);
  logger.log('=================================================');
}

bootstrap();
