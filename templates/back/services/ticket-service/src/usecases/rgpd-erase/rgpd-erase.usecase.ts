import { Injectable } from '@nestjs/common';
import { ITicketRepository } from '../../repositories/ticket.repository';

export interface RgpdEraseResult {
  service: string;
  statut: 'efface' | 'absent';
  tickets: number;
}

@Injectable()
export class RgpdEraseUseCase {
  constructor(private readonly ticketRepo: ITicketRepository) {}

  async execute(customerId: string): Promise<RgpdEraseResult> {
    const tickets = await this.ticketRepo.deleteByCustomerId(customerId);
    return { service: 'ticket', statut: tickets > 0 ? 'efface' : 'absent', tickets };
  }
}
