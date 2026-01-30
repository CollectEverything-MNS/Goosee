import { Controller, Get } from '@nestjs/common';
import { GetPagesUseCase } from './get-pages.usecase';
import { pagesRoutes } from '../../config/routes.config';

@Controller(pagesRoutes.root)
export class GetPagesController {
  constructor(private readonly getPagesUseCase: GetPagesUseCase) {}

  @Get()
  async getAll() {
    return this.getPagesUseCase.execute();
  }
}
