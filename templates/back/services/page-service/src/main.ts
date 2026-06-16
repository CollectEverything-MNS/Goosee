import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  if (process.env.NODE_ENV === 'production') {
    const requiredSecrets = ['PAGE_DB_PASSWORD', 'MINIO_ROOT_USER', 'MINIO_ROOT_PASSWORD'];
    const isDefault = (value?: string) =>
      !value || ['postgres', 'minioadmin'].includes(value) || value.includes('change_me');
    const invalid = requiredSecrets.filter((key) => isDefault(process.env[key]));
    if (invalid.length > 0) {
      throw new Error(`Secrets par défaut interdits en production : ${invalid.join(', ')}`);
    }
  }

  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const port = Number(process.env.PAGE_SERVICE_PORT);

  if (!port) {
    throw new Error('PAGE_SERVICE_PORT is not defined');
  }

  await app.listen(port);

  const logger = new Logger('PageService');
  logger.log(`Page Service is running on http://localhost:${port}`);
}

bootstrap();
