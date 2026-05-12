import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { ListProductTagsUseCase } from './list-product-tags.usecase';
import { productTagsRoutes } from '../../config/routes.config';

@Controller(productTagsRoutes.root)
export class ListProductTagsController {
  constructor(private readonly listProductTagsUseCase: ListProductTagsUseCase) {}

  @Get(productTagsRoutes.productTag.list)
  @ApiOperation({ summary: "Liste des tags d'un produit" })
  async listTags(@Param('id') productId: string) {
    return this.listProductTagsUseCase.execute(productId);
  }
}
