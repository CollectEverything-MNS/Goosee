import { Body, Controller, Param, Put } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { rolesRoutes } from '../../config/routes.config';
import { UpdateRoleUseCase } from './update-role.usecase';
import { UpdateRoleDto } from './update-role.dto';

@Controller(rolesRoutes.root)
export class UpdateRoleController {
  constructor(private readonly updateRoleUseCase: UpdateRoleUseCase) {}

  @Put(rolesRoutes.role.update)
  @ApiOperation({ summary: 'Mettre à jour un rôle' })
  async update(@Param('id') id: string, @Body() dto: UpdateRoleDto) {
    return this.updateRoleUseCase.execute(id, dto);
  }
}
