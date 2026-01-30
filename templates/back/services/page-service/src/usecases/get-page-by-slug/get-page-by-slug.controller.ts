import { Controller, Get, Param } from '@nestjs/common';
import { GetPageBySlugUseCase } from './get-page-by-slug.usecase';
import { pagesRoutes } from '../../config/routes.config';

@Controller(pagesRoutes.root)
export class GetPageBySlugController {
  constructor(private readonly getPageBySlugUseCase: GetPageBySlugUseCase) {}

  @Get(pagesRoutes.pages.bySlug)
  async getBySlug(@Param('slug') slug: string) {
    return this.getPageBySlugUseCase.execute(slug);
  }
}
