import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { ITicketRepository } from '../../repositories/ticket.repository';
import { Ticket, TicketStatus } from '../../entities/ticket.entity';
import { CloseTicketDto } from './close-ticket.dto';

@Injectable()
export class CloseTicketUseCase {
  constructor(
    private readonly ticketRepo: ITicketRepository,
    @Inject('RMQ_NOTIF_CLIENT') private readonly rmqNotif: ClientProxy
  ) {}

  async execute(ticketId: string, payload: CloseTicketDto): Promise<Ticket> {
    const ticket = await this.ticketRepo.findById(ticketId);

    if (!ticket) {
      throw new NotFoundException('Ticket introuvable');
    }

    ticket.comment = payload.comment;
    ticket.status = TicketStatus.DONE;

    const closedTicket = await this.ticketRepo.save(ticket);

    await lastValueFrom(
      this.rmqNotif.emit('send_notification', {
        type: 'EMAIL',
        data: {
          to: closedTicket.authorEmail,
          subject: `Votre ticket "${closedTicket.title}" est terminé`,
          html: `<p>Bonjour,</p><p>Votre ticket a été traité.</p><p><strong>Commentaire :</strong> ${closedTicket.comment}</p>`,
        },
      })
    );

    return closedTicket;
  }
}
