import { Body, Controller, Put } from '@nestjs/common';
import { ReorderMenusUseCase } from './reorder-menus.usecase';
import { ReorderMenusDto } from './reorder-menus.dto';
import { menusRoutes } from '../../config/routes.config';

@Controller(menusRoutes.root)
export class ReorderMenusController {
  constructor(private readonly reorderMenusUseCase: ReorderMenusUseCase) {}

  @Put(menusRoutes.menus.reorder)
  async reorder(@Body() dto: ReorderMenusDto) {
    return this.reorderMenusUseCase.execute(dto);
  }
}
