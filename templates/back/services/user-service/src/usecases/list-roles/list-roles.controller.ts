import { Controller, Get } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { rolesRoutes } from '../../config/routes.config';
import { ListRolesUseCase } from './list-roles.usecase';

@Controller(rolesRoutes.root)
export class ListRolesController {
  constructor(private readonly listRolesUseCase: ListRolesUseCase) {}

  @Get()
  @ApiOperation({ summary: 'Liste des rôles' })
  async list() {
    return this.listRolesUseCase.execute();
  }
}
