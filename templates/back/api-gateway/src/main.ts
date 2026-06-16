import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  if (process.env.NODE_ENV === 'production') {
    const requiredSecrets = ['JWT_SECRET', 'JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET'];
    const isDefault = (value?: string) =>
      !value || ['postgres', 'minioadmin'].includes(value) || value.includes('change_me');
    const invalid = requiredSecrets.filter((key) => isDefault(process.env[key]));
    if (invalid.length > 0) {
      throw new Error(`Secrets par défaut interdits en production : ${invalid.join(', ')}`);
    }
  }

  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  app.enableCors({
    origin: configService.get<string>('NEXT_PUBLIC_WEB_URL', 'http://localhost:3000'),
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  const nodeEnv = configService.get<string>('NODE_ENV', 'development');
  const port = configService.get<number>('API_GATEWAY_PORT', 3001);

  if (nodeEnv === 'development') {
    app.useLogger(['log', 'error', 'warn', 'debug', 'verbose']);

    const config = new DocumentBuilder()
      .setTitle(`Projet Goosee Generator - ${nodeEnv}`)
      .setDescription('API Gateway pour le projet Goosee Generator')
      .setVersion('1.0')
      .addBearerAuth()
      .addTag('User', 'Gestion des utilisateurs')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api-docs', app, document);
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
