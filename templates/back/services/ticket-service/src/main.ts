import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const port = Number(process.env.TICKET_SERVICE_PORT);
  if (!port) {
    throw new Error('TICKET_SERVICE_PORT is not defined');
  }

  await app.listen(port);

  const logger = new Logger('TicketService');
  logger.log(`Ticket Service is running on http://localhost:${port}`);
}

bootstrap();
