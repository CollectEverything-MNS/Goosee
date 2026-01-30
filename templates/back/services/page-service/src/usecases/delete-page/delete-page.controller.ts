import { Controller, Delete, HttpCode, HttpStatus, Param } from '@nestjs/common';
import { DeletePageUseCase } from './delete-page.usecase';
import { pagesRoutes } from '../../config/routes.config';

@Controller(pagesRoutes.root)
export class DeletePageController {
  constructor(private readonly deletePageUseCase: DeletePageUseCase) {}

  @Delete(pagesRoutes.pages.byId)
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string) {
    return this.deletePageUseCase.execute(id);
  }
}
