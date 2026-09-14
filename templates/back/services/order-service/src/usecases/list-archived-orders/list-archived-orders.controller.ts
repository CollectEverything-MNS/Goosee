import { Controller, Get, UseGuards } from '@nestjs/common';
import { InternalTokenGuard } from '../../shared/internal-token.guard';
import { ListArchivedOrdersUseCase } from './list-archived-orders.usecase';

// Sous `internal/rgpd` et non sous `orders` : l'archive est separee logiquement
// de la base active, et `GET /orders/:id` capturerait de toute facon un chemin
// `orders/archived`.
@Controller('internal/rgpd')
@UseGuards(InternalTokenGuard)
export class ListArchivedOrdersController {
  constructor(private readonly listArchivedOrders: ListArchivedOrdersUseCase) {}

  @Get('archived-orders')
  async list() {
    return this.listArchivedOrders.execute();
  }
}
