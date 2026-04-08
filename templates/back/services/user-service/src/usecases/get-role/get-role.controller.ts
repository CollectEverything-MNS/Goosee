import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { rolesRoutes } from '../../config/routes.config';
import { GetRoleUseCase } from './get-role.usecase';

@Controller(rolesRoutes.root)
export class GetRoleController {
  constructor(private readonly getRoleUseCase: GetRoleUseCase) {}

  @Get(rolesRoutes.role.getOne)
  @ApiOperation({ summary: 'Récupérer un rôle' })
  async get(@Param('id') id: string) {
    return this.getRoleUseCase.execute(id);
  }
}
