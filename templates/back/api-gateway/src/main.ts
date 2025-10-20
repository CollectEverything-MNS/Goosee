import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import 'reflect-metadata';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  const nodeEnv = configService.get<string>('NODE_ENV', 'development');
  const httpPort = configService.get<number>('SERVICE_PORT', 3001);
  const tcpPort = configService.get<number>('TCP_PORT', 3002);

  if (nodeEnv === 'development') {
    app.useLogger(['log', 'error', 'warn', 'debug', 'verbose']);
  } else {
    app.useLogger(['error', 'warn']);
  }

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: {
      host: '0.0.0.0',
      port: tcpPort,
    },
  });

  await app.startAllMicroservices();
  await app.listen(httpPort);

  const logger = new Logger('Bootstrap');
  logger.log('=================================================');
  logger.log(`🚀 API Gateway démarrée en mode ${nodeEnv.toUpperCase()}`);
  logger.log(`🌐 HTTP: http://localhost:${httpPort}`);
  logger.log(`🔌 TCP: ${tcpPort}`);
  logger.log('=================================================');
}

bootstrap();
