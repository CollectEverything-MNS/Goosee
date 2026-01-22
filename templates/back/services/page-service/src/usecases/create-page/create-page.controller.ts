import { Body, Controller, Post } from '@nestjs/common';
import { CreatePageUseCase } from './create-page.usecase';
import { CreatePageDto } from './create-page.dto';

@Controller('pages')
export class CreatePageController {
  constructor(private readonly createPageUseCase: CreatePageUseCase) {}

  @Post()
  async create(@Body() dto: CreatePageDto) {
    return this.createPageUseCase.execute(dto);
  }
}
