import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { GetProductAttributeUseCase } from './get-product-attribute.usecase';
import { productAttributesRoutes } from '../../config/routes.config';

@Controller(productAttributesRoutes.root)
export class GetProductAttributeController {
  constructor(private readonly getProductAttributeUseCase: GetProductAttributeUseCase) {}

  @Get(productAttributesRoutes.attribute.getOne)
  @ApiOperation({ summary: "Récupération d'un attribut d'un produit" })
  async getAttribute(@Param('id') productId: string, @Param('attributeId') attributeId: string) {
    return this.getProductAttributeUseCase.execute(productId, attributeId);
  }
}
