import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { HealthController } from './health/health.controller';
import { MetricsController } from './metrics/metrics.controller';

import { Stock } from './entities/stock.entity';
import { StockReservation } from './entities/stock-reservation.entity';
import { StockMovement } from './entities/stock-movement.entity';

import { IStockRepository } from './repositories/stock.repository';
import { TypeOrmStockRepository } from './repositories/implements/stock.impl.repository';
import { IStockReservationRepository } from './repositories/stock-reservation.repository';
import { TypeOrmStockReservationRepository } from './repositories/implements/stock-reservation.impl.repository';
import { IStockMovementRepository } from './repositories/stock-movement.repository';
import { TypeOrmStockMovementRepository } from './repositories/implements/stock-movement.impl.repository';

import { ReserveStockUseCase } from './usecases/reserve-stock/reserve-stock.usecase';
import { ReserveStockController } from './usecases/reserve-stock/reserve-stock.controller';
import { ConfirmReservationUseCase } from './usecases/confirm-reservation/confirm-reservation.usecase';
import { ConfirmReservationEventsListener } from './usecases/confirm-reservation/confirm-reservation.event';
import { ReleaseReservationUseCase } from './usecases/release-reservation/release-reservation.usecase';
import { ReleaseReservationEventsListener } from './usecases/release-reservation/release-reservation.event';
import { AdjustStockUseCase } from './usecases/adjust-stock/adjust-stock.usecase';
import { AdjustStockController } from './usecases/adjust-stock/adjust-stock.controller';
import { GetStockUseCase } from './usecases/get-stock/get-stock.usecase';
import { GetStockController } from './usecases/get-stock/get-stock.controller';
import { ListStockUseCase } from './usecases/list-stock/list-stock.usecase';
import { ListStockController } from './usecases/list-stock/list-stock.controller';
import { ListStockMovementsUseCase } from './usecases/list-stock-movements/list-stock-movements.usecase';
import { ListStockMovementsController } from './usecases/list-stock-movements/list-stock-movements.controller';

import { ReservationSweeperService } from './shared/reservation-sweeper.service';

const ENTITIES = [Stock, StockReservation, StockMovement];

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        type: 'postgres',
        host: cfg.get<string>('STOCK_DB_HOST'),
        port: cfg.get<number>('STOCK_DB_PORT'),
        username: cfg.get<string>('STOCK_DB_USER'),
        password: cfg.get<string>('STOCK_DB_PASSWORD'),
        database: cfg.get<string>('STOCK_DB_NAME'),
        entities: ENTITIES,
        migrations: ['dist/migrations/*.js'],
        migrationsRun: cfg.get<string>('NODE_ENV') !== 'development',
        synchronize: cfg.get<string>('NODE_ENV') === 'development',
      }),
    }),

    TypeOrmModule.forFeature(ENTITIES),
  ],
  controllers: [
    HealthController,
    MetricsController,
    ReserveStockController,
    ConfirmReservationEventsListener,
    ReleaseReservationEventsListener,
    AdjustStockController,
    GetStockController,
    ListStockController,
    ListStockMovementsController,
  ],
  providers: [
    { provide: IStockRepository, useClass: TypeOrmStockRepository },
    { provide: IStockReservationRepository, useClass: TypeOrmStockReservationRepository },
    { provide: IStockMovementRepository, useClass: TypeOrmStockMovementRepository },
    ReserveStockUseCase,
    ConfirmReservationUseCase,
    ReleaseReservationUseCase,
    AdjustStockUseCase,
    GetStockUseCase,
    ListStockUseCase,
    ListStockMovementsUseCase,
    ReservationSweeperService,
  ],
})
export class AppModule {}
