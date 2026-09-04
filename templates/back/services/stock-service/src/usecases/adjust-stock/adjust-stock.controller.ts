import { Body, Controller, Param, Patch } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { AdjustStockDto } from './adjust-stock.dto';
import { AdjustStockUseCase } from './adjust-stock.usecase';

@Controller('stock')
export class AdjustStockController {
  constructor(private readonly adjustStockUseCase: AdjustStockUseCase) {}

  @Patch(':productId')
  @ApiOperation({ summary: "Ajuste le stock d'un produit (delta)" })
  async adjust(@Param('productId') productId: string, @Body() dto: AdjustStockDto) {
    return this.adjustStockUseCase.execute(productId, dto);
  }
}
