import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { ReserveStockDto } from './reserve-stock.dto';
import { ReserveStockUseCase } from './reserve-stock.usecase';

@Controller('stock')
export class ReserveStockController {
  constructor(private readonly reserveStockUseCase: ReserveStockUseCase) {}

  @Post('reserve')
  @ApiOperation({ summary: 'Réserve du stock pour une commande (tout ou rien)' })
  async reserve(@Body() dto: ReserveStockDto) {
    return this.reserveStockUseCase.execute(dto);
  }
}
