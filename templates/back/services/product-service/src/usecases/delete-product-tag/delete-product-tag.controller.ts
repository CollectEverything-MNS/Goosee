import { Controller, Delete, Param } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { deleteProductTagUseCase } from './delete-product-tag.usecase';
import { productTagsRoutes } from '../../config/routes.config';

@Controller(productTagsRoutes.root)
export class deleteProductTagController {
  constructor(private readonly deleteProductTagUseCase: deleteProductTagUseCase) {}

  @Delete(productTagsRoutes.productTag.delete)
  @ApiOperation({ summary: "Retirer un tag d'un produit" })
  async deleteTag(@Param('id') productId: string, @Param('tagId') tagId: string) {
    return this.deleteProductTagUseCase.execute(productId, tagId);
  }
}
