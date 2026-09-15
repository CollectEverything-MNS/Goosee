import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  if (process.env.NODE_ENV === 'production' && !process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not defined');
  }

  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const port = Number(process.env.ASSISTANT_SERVICE_PORT);
  if (!port) {
    throw new Error('ASSISTANT_SERVICE_PORT is not defined');
  }

  await app.listen(port);

  const logger = new Logger('AssistantService');
  logger.log(`Assistant Service is running on http://localhost:${port}`);
  if (!process.env.GEMINI_API_KEY) {
    logger.warn(
      "GEMINI_API_KEY absente : les requetes repondront 503 tant que la cle n'est pas renseignee"
    );
  }
}

bootstrap();
