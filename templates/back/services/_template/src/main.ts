import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.TCP,
    options: {
      host: process.env.HOST || '0.0.0.0',
      port: Number(process.env.USER_SERVICE_PORT) || 3003,
    },
  });

  const logger = new Logger('UserService');
  await app.listen();
  logger.log(`🚀 User Service is running`);
  logger.log(`   TCP: 0.0.0.0:${process.env.USER_SERVICE_PORT || 3003}`);
}

bootstrap();
