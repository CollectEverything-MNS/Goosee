import { Body, Controller, Post } from '@nestjs/common';
import { CreateMenuUseCase } from './create-menu.usecase';
import { CreateMenuDto } from './create-menu.dto';
import { menusRoutes } from '../../config/routes.config';

@Controller(menusRoutes.root)
export class CreateMenuController {
  constructor(private readonly createMenuUseCase: CreateMenuUseCase) {}

  @Post()
  async create(@Body() dto: CreateMenuDto) {
    return this.createMenuUseCase.execute(dto);
  }
}
