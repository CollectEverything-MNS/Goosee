import { Controller, Get, Param } from '@nestjs/common';
import { GetPageUseCase } from './get-page.usecase';
import { pagesRoutes } from '../../config/routes.config';

@Controller(pagesRoutes.root)
export class GetPageController {
  constructor(private readonly getPageUseCase: GetPageUseCase) {}

  @Get(pagesRoutes.pages.byId)
  async getOne(@Param('id') id: string) {
    return this.getPageUseCase.execute(id);
  }
}
