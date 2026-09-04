import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { ListStockMovementsUseCase } from './list-stock-movements.usecase';

@Controller('stock')
export class ListStockMovementsController {
  constructor(private readonly listStockMovementsUseCase: ListStockMovementsUseCase) {}

  @Get(':productId/movements')
  @ApiOperation({ summary: "Historique des mouvements de stock d'un produit" })
  async list(@Param('productId') productId: string) {
    return this.listStockMovementsUseCase.execute(productId);
  }
}
