import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { ListProductAttributesUseCase } from './list-product-attributes.usecase';
import { productAttributesRoutes } from '../../config/routes.config';

@Controller(productAttributesRoutes.root)
export class ListProductAttributesController {
  constructor(private readonly listProductAttributesUseCase: ListProductAttributesUseCase) {}

  @Get(productAttributesRoutes.attribute.list)
  @ApiOperation({ summary: "Liste des attributs d'un produit" })
  async listAttributes(@Param('id') productId: string) {
    return this.listProductAttributesUseCase.execute(productId);
  }
}
