import { Controller, Get } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { ListStockUseCase } from './list-stock.usecase';

@Controller('stock')
export class ListStockController {
  constructor(private readonly listStockUseCase: ListStockUseCase) {}

  @Get()
  @ApiOperation({ summary: 'Lister le stock de tous les produits' })
  async list() {
    return this.listStockUseCase.execute();
  }
}
