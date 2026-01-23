import { Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { SeedPagesUseCase } from './seed-pages.usecase';
import { pagesRoutes } from '../../config/routes.config';

@Controller(pagesRoutes.root)
export class SeedPagesController {
  constructor(private readonly seedPagesUseCase: SeedPagesUseCase) {}

  @Post(pagesRoutes.pages.seed)
  @HttpCode(HttpStatus.OK)
  async seed() {
    await this.seedPagesUseCase.execute();
    return { message: 'Pages seeded successfully' };
  }
}
