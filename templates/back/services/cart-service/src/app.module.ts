import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { HealthController } from './health/health.controller';
import { MetricsController } from './metrics/metrics.controller';

import { Cart } from './entities/cart.entity';

import { ICartRepository } from './repositories/cart.repository';
import { TypeOrmCartRepository } from './repositories/implements/cart.impl.repository';

import { GetCartController } from './usecases/get-cart/get-cart.controller';
import { GetCartUseCase } from './usecases/get-cart/get-cart.usecase';
import { AddItemController } from './usecases/add-item/add-item.controller';
import { AddItemUseCase } from './usecases/add-item/add-item.usecase';
import { UpdateItemController } from './usecases/update-item/update-item.controller';
import { UpdateItemUseCase } from './usecases/update-item/update-item.usecase';
import { RemoveItemController } from './usecases/remove-item/remove-item.controller';
import { RemoveItemUseCase } from './usecases/remove-item/remove-item.usecase';
import { ClearCartController } from './usecases/clear-cart/clear-cart.controller';
import { ClearCartUseCase } from './usecases/clear-cart/clear-cart.usecase';

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
        host: configService.get<string>('CART_DB_HOST'),
        port: configService.get<number>('CART_DB_PORT'),
        username: configService.get<string>('CART_DB_USER'),
        password: configService.get<string>('CART_DB_PASSWORD'),
        database: configService.get<string>('CART_DB_NAME'),
        entities: [Cart],
        migrations: ['dist/migrations/*.js'],
        migrationsRun: configService.get<string>('NODE_ENV') !== 'development',
        synchronize: configService.get<string>('NODE_ENV') === 'development',
      }),
    }),
    TypeOrmModule.forFeature([Cart]),
  ],
  controllers: [
    HealthController,
    MetricsController,
    GetCartController,
    AddItemController,
    UpdateItemController,
    RemoveItemController,
    ClearCartController,
  ],
  providers: [
    {
      provide: ICartRepository,
      useClass: TypeOrmCartRepository,
    },
    GetCartUseCase,
    AddItemUseCase,
    UpdateItemUseCase,
    RemoveItemUseCase,
    ClearCartUseCase,
  ],
})
export class AppModule {}
