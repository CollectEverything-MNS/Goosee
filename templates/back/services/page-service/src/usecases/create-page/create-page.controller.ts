import { Body, Controller, Post } from '@nestjs/common';
import { CreatePageUseCase } from './create-page.usecase';
import { CreatePageDto } from './create-page.dto';
import { pagesRoutes } from '../../config/routes.config';

@Controller(pagesRoutes.root)
export class CreatePageController {
  constructor(private readonly createPageUseCase: CreatePageUseCase) {}

  @Post()
  async create(@Body() dto: CreatePageDto) {
    return this.createPageUseCase.execute(dto);
  }
}
