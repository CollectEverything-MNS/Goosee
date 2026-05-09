import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { GetTagUseCase } from './get-tag.usecase';
import { tagsRoutes } from '../../config/routes.config';

@Controller(tagsRoutes.root)
export class GetTagController {
  constructor(private readonly getTagUseCase: GetTagUseCase) {}

  @Get(tagsRoutes.tag.getOne)
  @ApiOperation({ summary: "Récupération d'un tag" })
  async getTag(@Param('id') id: string) {
    return this.getTagUseCase.execute(id);
  }
}
