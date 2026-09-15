import { Injectable } from '@nestjs/common';
import { ITicketRepository } from '../../repositories/ticket.repository';

@Injectable()
export class RgpdExportUseCase {
  constructor(private readonly ticketRepo: ITicketRepository) {}

  async execute(customerId: string) {
    const tickets = await this.ticketRepo.findByAuthorId(customerId);
    return {
      // `description` et `commentaire` sont du texte libre ecrit par la
      // personne : l'article 20 porte d'abord sur ce qu'elle a fourni.
      tickets: tickets.map((ticket) => ({
        sujet: ticket.title,
        description: ticket.description,
        commentaire: ticket.comment ?? null,
        date: ticket.createdAt,
        statut: ticket.status,
      })),
    };
  }
}
