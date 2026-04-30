import { Body, Controller, Patch, Param } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { UpdateProductStockDto } from './update-product-stock.dto';
import { UpdateProductStockUseCase } from './update-product-stock.usecase';
import { productsRoutes } from '../../config/routes.config';

@Controller(productsRoutes.root)
export class UpdateProductStockController {
  constructor(private readonly updateProductStockUseCase: UpdateProductStockUseCase) {}

  @Patch(productsRoutes.product.updateStock)
  @ApiOperation({ summary: "Mise à jour du stock d'un produit" })
  async updateStock(@Param('id') id: string, @Body() dto: UpdateProductStockDto) {
    return this.updateProductStockUseCase.execute(id, dto);
  }
}
