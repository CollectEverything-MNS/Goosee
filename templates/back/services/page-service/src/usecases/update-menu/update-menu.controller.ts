import { Body, Controller, Param, Put } from '@nestjs/common';
import { UpdateMenuUseCase } from './update-menu.usecase';
import { UpdateMenuDto } from './update-menu.dto';
import { menusRoutes } from '../../config/routes.config';

@Controller(menusRoutes.root)
export class UpdateMenuController {
  constructor(private readonly updateMenuUseCase: UpdateMenuUseCase) {}

  @Put(menusRoutes.menus.byId)
  async update(@Param('id') id: string, @Body() dto: UpdateMenuDto) {
    return this.updateMenuUseCase.execute(id, dto);
  }
}
