import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Log } from './entities/log.entity';

import { ILogRepository } from './repositories/log.repository';
import { TypeOrmLogRepository } from './repositories/implements/log.impl.repository';

import { CreateLogUseCase } from './usecases/create-log/create-log.usecase';
import { CreateLogEventsListener } from './usecases/create-log/create-log.event';
import { ListLogsUseCase } from './usecases/list-logs/list-logs.usecase';
import { ListLogsController } from './usecases/list-logs/list-logs.controller';

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
        host: configService.get<string>('LOG_DB_HOST'),
        port: configService.get<number>('LOG_DB_PORT'),
        username: configService.get<string>('LOG_DB_USER'),
        password: configService.get<string>('LOG_DB_PASSWORD'),
        database: configService.get<string>('LOG_DB_NAME'),
        entities: [Log],
        synchronize: configService.get<string>('NODE_ENV') === 'development',
      }),
    }),
    TypeOrmModule.forFeature([Log]),
  ],
  controllers: [CreateLogEventsListener, ListLogsController],
  providers: [
    {
      provide: ILogRepository,
      useClass: TypeOrmLogRepository,
    },
    CreateLogUseCase,
    ListLogsUseCase,
  ],
})
export class AppModule {}
