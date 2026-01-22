import { Controller, Get, Param } from '@nestjs/common';
import { GetPageUseCase } from './get-page.usecase';

@Controller('pages')
export class GetPageController {
  constructor(private readonly getPageUseCase: GetPageUseCase) {}

  @Get(':id')
  async getOne(@Param('id') id: string) {
    return this.getPageUseCase.execute(id);
  }
}
