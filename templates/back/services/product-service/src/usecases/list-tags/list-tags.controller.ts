import { Controller, Get } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { ListTagsUseCase } from './list-tags.usecase';
import { tagsRoutes } from '../../config/routes.config';

@Controller()
export class ListTagsController {
  constructor(private readonly listTagsUseCase: ListTagsUseCase) {}

  @Get(tagsRoutes.root)
  @ApiOperation({ summary: 'Liste des tags' })
  async listTags() {
    return this.listTagsUseCase.execute();
  }
}
