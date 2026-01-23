import { Body, Controller, Param, Put } from '@nestjs/common';
import { UpdatePageUseCase } from './update-page.usecase';
import { UpdatePageDto } from './update-page.dto';
import { pagesRoutes } from '../../config/routes.config';

@Controller(pagesRoutes.root)
export class UpdatePageController {
  constructor(private readonly updatePageUseCase: UpdatePageUseCase) {}

  @Put(pagesRoutes.pages.byId)
  async update(@Param('id') id: string, @Body() dto: UpdatePageDto) {
    return this.updatePageUseCase.execute(id, dto);
  }
}
