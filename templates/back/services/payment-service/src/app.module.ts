import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { HealthController } from './health/health.controller';
import { MetricsController } from './metrics/metrics.controller';

import { Payment } from './entities/payment.entity';

import { IPaymentRepository } from './repositories/payment.repository';
import { TypeOrmPaymentRepository } from './repositories/implements/payment.impl.repository';

import { IPaymentProvider } from './providers/payment-provider.interface';
import { StripePaymentProvider } from './providers/implements/stripe-payment.provider';

import { CreatePaymentController } from './usecases/create-payment/create-payment.controller';
import { CreatePaymentUseCase } from './usecases/create-payment/create-payment.usecase';
import { GetPaymentController } from './usecases/get-payment/get-payment.controller';
import { GetPaymentUseCase } from './usecases/get-payment/get-payment.usecase';
import { HandleWebhookController } from './usecases/handle-webhook/handle-webhook.controller';
import { HandleWebhookUseCase } from './usecases/handle-webhook/handle-webhook.usecase';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('PAYMENT_DB_HOST'),
        port: configService.get<number>('PAYMENT_DB_PORT'),
        username: configService.get<string>('PAYMENT_DB_USER'),
        password: configService.get<string>('PAYMENT_DB_PASSWORD'),
        database: configService.get<string>('PAYMENT_DB_NAME'),
        entities: [Payment],
        migrations: ['dist/migrations/*.js'],
        migrationsRun: configService.get<string>('NODE_ENV') !== 'development',
        synchronize: configService.get<string>('NODE_ENV') === 'development',
      }),
    }),
    TypeOrmModule.forFeature([Payment]),
  ],
  controllers: [
    HealthController,
    MetricsController,
    CreatePaymentController,
    GetPaymentController,
    HandleWebhookController,
  ],
  providers: [
    {
      provide: IPaymentRepository,
      useClass: TypeOrmPaymentRepository,
    },
    {
      provide: IPaymentProvider,
      useClass: StripePaymentProvider,
    },
    CreatePaymentUseCase,
    GetPaymentUseCase,
    HandleWebhookUseCase,
  ],
})
export class AppModule {}
