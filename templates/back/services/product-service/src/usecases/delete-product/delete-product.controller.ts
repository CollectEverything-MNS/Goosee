import { Controller, Delete, Param } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { DeleteProductUseCase } from './delete-product.usecase';
import { productsRoutes } from '../../config/routes.config';

@Controller(productsRoutes.root)
export class DeleteProductController {
  constructor(private readonly deleteProductUseCase: DeleteProductUseCase) {}

  @Delete(productsRoutes.product.delete)
  @ApiOperation({ summary: "Suppression d'un produit" })
  async deleteProduct(@Param('id') id: string) {
    return this.deleteProductUseCase.execute(id);
  }
}
