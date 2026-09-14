import { Injectable } from '@nestjs/common';
import { IOrderRepository } from '../../repositories/order.repository';

@Injectable()
export class ListArchivedOrdersUseCase {
  constructor(private readonly orderRepo: IOrderRepository) {}

  // L'archivage intermediaire n'a de sens que si l'archive reste lisible : une
  // piece comptable doit pouvoir etre produite pendant dix ans. `list()` et
  // `findByCustomer()` ecartent les commandes archivees ; c'est ici, et nulle
  // part ailleurs, qu'on les retrouve.
  async execute() {
    const commandes = await this.orderRepo.listArchived();
    return { message: 'Archived orders fetched successfully', commandes };
  }
}
