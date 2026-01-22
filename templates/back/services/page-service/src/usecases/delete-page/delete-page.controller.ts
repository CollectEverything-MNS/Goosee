import { Controller, Delete, HttpCode, HttpStatus, Param } from '@nestjs/common';
import { DeletePageUseCase } from './delete-page.usecase';

@Controller('pages')
export class DeletePageController {
  constructor(private readonly deletePageUseCase: DeletePageUseCase) {}

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string) {
    return this.deletePageUseCase.execute(id);
  }
}
