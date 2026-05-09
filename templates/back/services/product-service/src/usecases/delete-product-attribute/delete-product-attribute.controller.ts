import { Controller, Delete, Param } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { deleteProductAttributeUseCase } from './delete-product-attribute.usecase';
import { productAttributesRoutes } from '../../config/routes.config';

@Controller(productAttributesRoutes.root)
export class deleteProductAttributeController {
  constructor(private readonly deleteProductAttributeUseCase: deleteProductAttributeUseCase) {}

  @Delete(productAttributesRoutes.attribute.delete)
  @ApiOperation({ summary: "Suppression d'un attribut d'un produit" })
  async deleteAttribute(@Param('id') productId: string, @Param('attributeId') attributeId: string) {
    return this.deleteProductAttributeUseCase.execute(productId, attributeId);
  }
}
