import { Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { SeedPagesUseCase } from './seed-pages.usecase';

@Controller('pages')
export class SeedPagesController {
  constructor(private readonly seedPagesUseCase: SeedPagesUseCase) {}

  @Post('seed')
  @HttpCode(HttpStatus.OK)
  async seed() {
    await this.seedPagesUseCase.execute();
    return { message: 'Pages seeded successfully' };
  }
}
