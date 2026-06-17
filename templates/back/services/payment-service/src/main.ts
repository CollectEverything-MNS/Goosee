import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  if (process.env.NODE_ENV === 'production') {
    const requiredSecrets = ['PAYMENT_DB_PASSWORD'];
    const isDefault = (value?: string) =>
      !value || ['postgres', 'minioadmin'].includes(value) || value.includes('change_me');
    const invalid = requiredSecrets.filter((key) => isDefault(process.env[key]));
    if (invalid.length > 0) {
      throw new Error(`Secrets par défaut interdits en production : ${invalid.join(', ')}`);
    }
  }

  // NB : la vérification de signature du webhook Stripe a besoin du corps brut.
  // On active rawBody pour que le provider puisse appeler stripe.webhooks.constructEvent.
  const app = await NestFactory.create(AppModule, { rawBody: true });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const port = Number(process.env.PAYMENT_SERVICE_PORT);
  if (!port) {
    throw new Error('PAYMENT_SERVICE_PORT is not defined');
  }

  await app.listen(port);
  new Logger('PaymentService').log(`Payment Service is running on http://localhost:${port}`);
}

bootstrap();
