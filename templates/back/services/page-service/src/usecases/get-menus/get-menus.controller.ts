import { Controller, Get } from '@nestjs/common';
import { GetMenusUseCase } from './get-menus.usecase';
import { menusRoutes } from '../../config/routes.config';

@Controller(menusRoutes.root)
export class GetMenusController {
  constructor(private readonly getMenusUseCase: GetMenusUseCase) {}

  @Get()
  async getAll() {
    return this.getMenusUseCase.execute();
  }
}
