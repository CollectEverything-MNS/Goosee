import { Body, Controller, Param, Patch } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { UpdateProductDto } from './update-product.dto';
import { UpdateProductUseCase } from './update-product.usecase';
import { productsRoutes } from '../../config/routes.config';

@Controller(productsRoutes.root)
export class UpdateProductController {
  constructor(private readonly updateProductUseCase: UpdateProductUseCase) {}

  @Patch(productsRoutes.product.update)
  @ApiOperation({ summary: "Mise à jour d'un produit" })
  async updateProduct(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.updateProductUseCase.execute(id, dto);
  }
}
