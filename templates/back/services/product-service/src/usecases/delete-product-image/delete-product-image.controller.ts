import { Controller, Delete, Param } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { DeleteProductImageUseCase } from './delete-product-image.usecase';
import { productImagesRoutes } from '../../config/routes.config';

@Controller(productImagesRoutes.root)
export class DeleteProductImageController {
  constructor(private readonly deleteProductImageUseCase: DeleteProductImageUseCase) {}

  @Delete(productImagesRoutes.image.delete)
  @ApiOperation({ summary: "Suppression d'une image produit" })
  async deleteImage(@Param('id') productId: string, @Param('imageId') imageId: string) {
    return this.deleteProductImageUseCase.execute(productId, imageId);
  }
}
