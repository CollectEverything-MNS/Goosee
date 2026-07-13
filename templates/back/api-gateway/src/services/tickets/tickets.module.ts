import { Module } from '@nestjs/common';
import { SharedSecurityModule } from '../../shared/shared-security.module';
import { CreateTicketController } from './usecases/create-ticket/create-ticket.controller';
import { ListTicketsController } from './usecases/list-tickets/list-tickets.controller';
import { AssignTicketController } from './usecases/assign-ticket/assign-ticket.controller';
import { UpdateTicketStatusController } from './usecases/update-ticket-status/update-ticket-status.controller';
import { CloseTicketController } from './usecases/close-ticket/close-ticket.controller';
import { DeleteTicketController } from './usecases/delete-ticket/delete-ticket.controller';
import { GetTicketController } from './usecases/get-ticket/get-ticket.controller';

@Module({
  imports: [SharedSecurityModule],
  controllers: [
    CreateTicketController,
    ListTicketsController,
    AssignTicketController,
    UpdateTicketStatusController,
    CloseTicketController,
    DeleteTicketController,
    GetTicketController,
  ],
  providers: [],
  exports: [],
})
export class TicketsModule {}
