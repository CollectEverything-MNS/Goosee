import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { GetStockUseCase } from './get-stock.usecase';

@Controller('stock')
export class GetStockController {
  constructor(private readonly getStockUseCase: GetStockUseCase) {}

  @Get(':productId')
  @ApiOperation({ summary: "Récupérer le stock d'un produit" })
  async get(@Param('productId') productId: string) {
    return this.getStockUseCase.execute(productId);
  }
}
