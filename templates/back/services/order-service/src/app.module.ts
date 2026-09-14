import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices';

import { HealthController } from './health/health.controller';
import { MetricsController } from './metrics/metrics.controller';
import { InternalKpiController } from './internal/internal-kpi.controller';

import { Order } from './entities/order.entity';

import { IOrderRepository } from './repositories/order.repository';
import { TypeOrmOrderRepository } from './repositories/implements/order.impl.repository';

import { CreateOrderController } from './usecases/create-order/create-order.controller';
import { CreateOrderUseCase } from './usecases/create-order/create-order.usecase';
import { ListOrdersController } from './usecases/list-orders/list-orders.controller';
import { ListOrdersUseCase } from './usecases/list-orders/list-orders.usecase';
import { GetOrderController } from './usecases/get-order/get-order.controller';
import { GetOrderUseCase } from './usecases/get-order/get-order.usecase';
import { UpdateOrderStatusController } from './usecases/update-order-status/update-order-status.controller';
import { UpdateOrderStatusUseCase } from './usecases/update-order-status/update-order-status.usecase';
import { RgpdEraseController } from './usecases/rgpd-erase/rgpd-erase.controller';
import { RgpdEraseUseCase } from './usecases/rgpd-erase/rgpd-erase.usecase';
import { ProductClient } from './shared/product-client.service';
import { StockClient } from './shared/stock-client.service';

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
        host: configService.get<string>('ORDER_DB_HOST'),
        port: configService.get<number>('ORDER_DB_PORT'),
        username: configService.get<string>('ORDER_DB_USER'),
        password: configService.get<string>('ORDER_DB_PASSWORD'),
        database: configService.get<string>('ORDER_DB_NAME'),
        entities: [Order],
        migrations: ['dist/migrations/*.js'],
        migrationsRun: configService.get<string>('NODE_ENV') !== 'development',
        synchronize: configService.get<string>('NODE_ENV') === 'development',
      }),
    }),
    TypeOrmModule.forFeature([Order]),

    ClientsModule.registerAsync([
      {
        name: 'STOCK_CLIENT',
        inject: [ConfigService],
        useFactory: (cfg: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [cfg.get<string>('RABBITMQ_URL')!],
            queue: 'stock_events',
            queueOptions: { durable: true },
          },
        }),
      },
    ]),
  ],
  controllers: [
    HealthController,
    MetricsController,
    InternalKpiController,
    CreateOrderController,
    ListOrdersController,
    GetOrderController,
    UpdateOrderStatusController,
    RgpdEraseController,
  ],
  providers: [
    {
      provide: IOrderRepository,
      useClass: TypeOrmOrderRepository,
    },
    CreateOrderUseCase,
    ListOrdersUseCase,
    GetOrderUseCase,
    UpdateOrderStatusUseCase,
    RgpdEraseUseCase,
    ProductClient,
    StockClient,
  ],
})
export class AppModule {}
