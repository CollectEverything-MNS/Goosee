import { Controller, Get } from '@nestjs/common';
import { GetPagesUseCase } from './get-pages.usecase';

@Controller('pages')
export class GetPagesController {
  constructor(private readonly getPagesUseCase: GetPagesUseCase) {}

  @Get()
  async getAll() {
    return this.getPagesUseCase.execute();
  }
}
