import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { RmqOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  if (process.env.NODE_ENV === 'production') {
    const requiredSecrets = ['STOCK_DB_PASSWORD'];
    const isDefault = (value?: string) =>
      !value || ['postgres', 'minioadmin'].includes(value) || value.includes('change_me');
    const invalid = requiredSecrets.filter((key) => isDefault(process.env[key]));
    if (invalid.length > 0) {
      throw new Error(`Secrets par défaut interdits en production : ${invalid.join(', ')}`);
    }
  }

  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const url = process.env.RABBITMQ_URL;
  if (!url) {
    throw new Error('RABBITMQ_URL is not defined');
  }

  app.connectMicroservice<RmqOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [url],
      queue: 'stock_events',
      queueOptions: { durable: true },
    },
  });

  await app.startAllMicroservices();

  const port = Number(process.env.STOCK_SERVICE_PORT);
  if (!port) {
    throw new Error('STOCK_SERVICE_PORT is not defined');
  }

  await app.listen(port);

  const logger = new Logger('StockService');
  logger.log(`Stock Service is running on http://localhost:${port}`);
}

bootstrap();
