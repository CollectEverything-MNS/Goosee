import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices';

import { Ticket } from './entities/ticket.entity';

import { ITicketRepository } from './repositories/ticket.repository';
import { TypeOrmTicketRepository } from './repositories/implements/ticket.impl.repository';

import { CreateTicketUseCase } from './usecases/create-ticket/create-ticket.usecase';
import { CreateTicketController } from './usecases/create-ticket/create-ticket.controller';
import { AssignTicketUseCase } from './usecases/assign-ticket/assign-ticket.usecase';
import { AssignTicketController } from './usecases/assign-ticket/assign-ticket.controller';
import { UpdateTicketStatusUseCase } from './usecases/update-ticket-status/update-ticket-status.usecase';
import { UpdateTicketStatusController } from './usecases/update-ticket-status/update-ticket-status.controller';
import { CloseTicketUseCase } from './usecases/close-ticket/close-ticket.usecase';
import { CloseTicketController } from './usecases/close-ticket/close-ticket.controller';
import { ListTicketsUseCase } from './usecases/list-tickets/list-tickets.usecase';
import { ListTicketsController } from './usecases/list-tickets/list-tickets.controller';
import { DeleteTicketUseCase } from './usecases/delete-ticket/delete-ticket.usecase';
import { DeleteTicketController } from './usecases/delete-ticket/delete-ticket.controller';
import { GetTicketUseCase } from './usecases/get-ticket/get-ticket.usecase';
import { GetTicketController } from './usecases/get-ticket/get-ticket.controller';
import { RgpdEraseController } from './usecases/rgpd-erase/rgpd-erase.controller';
import { RgpdEraseUseCase } from './usecases/rgpd-erase/rgpd-erase.usecase';

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
        host: configService.get<string>('TICKET_DB_HOST'),
        port: configService.get<number>('TICKET_DB_PORT'),
        username: configService.get<string>('TICKET_DB_USER'),
        password: configService.get<string>('TICKET_DB_PASSWORD'),
        database: configService.get<string>('TICKET_DB_NAME'),
        entities: [Ticket],
        synchronize: configService.get<string>('NODE_ENV') === 'development',
      }),
    }),
    TypeOrmModule.forFeature([Ticket]),
    ClientsModule.registerAsync([
      {
        name: 'RMQ_NOTIF_CLIENT',
        useFactory: (cfg: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [cfg.get<string>('RABBITMQ_URL')!],
            queue: 'notifications_queue',
            queueOptions: { durable: true },
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [
    CreateTicketController,
    AssignTicketController,
    UpdateTicketStatusController,
    CloseTicketController,
    ListTicketsController,
    DeleteTicketController,
    GetTicketController,
    RgpdEraseController,
  ],
  providers: [
    {
      provide: ITicketRepository,
      useClass: TypeOrmTicketRepository,
    },
    CreateTicketUseCase,
    AssignTicketUseCase,
    UpdateTicketStatusUseCase,
    CloseTicketUseCase,
    ListTicketsUseCase,
    DeleteTicketUseCase,
    GetTicketUseCase,
    RgpdEraseUseCase,
  ],
})
export class AppModule {}
