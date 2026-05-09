import { Controller, Delete, Param } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { DeleteTagUseCase } from './delete-tag.usecase';
import { tagsRoutes } from '../../config/routes.config';

@Controller(tagsRoutes.root)
export class DeleteTagController {
  constructor(private readonly deleteTagUseCase: DeleteTagUseCase) {}

  @Delete(tagsRoutes.tag.delete)
  @ApiOperation({ summary: "Suppression d'un tag" })
  async deleteTag(@Param('id') id: string) {
    return this.deleteTagUseCase.execute(id);
  }
}
