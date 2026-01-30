import { Controller, Delete, Param } from '@nestjs/common';
import { DeleteMenuUseCase } from './delete-menu.usecase';
import { menusRoutes } from '../../config/routes.config';

@Controller(menusRoutes.root)
export class DeleteMenuController {
  constructor(private readonly deleteMenuUseCase: DeleteMenuUseCase) {}

  @Delete(menusRoutes.menus.byId)
  async delete(@Param('id') id: string) {
    return this.deleteMenuUseCase.execute(id);
  }
}
