import { Controller, Get, Param } from '@nestjs/common';
import { GetPageBySlugUseCase } from './get-page-by-slug.usecase';

@Controller('pages')
export class GetPageBySlugController {
  constructor(private readonly getPageBySlugUseCase: GetPageBySlugUseCase) {}

  @Get('slug/:slug')
  async getBySlug(@Param('slug') slug: string) {
    return this.getPageBySlugUseCase.execute(slug);
  }
}
