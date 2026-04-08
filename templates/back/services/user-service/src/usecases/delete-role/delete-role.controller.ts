import { Controller, Delete, Param } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { rolesRoutes } from '../../config/routes.config';
import { DeleteRoleUseCase } from './delete-role.usecase';

@Controller(rolesRoutes.root)
export class DeleteRoleController {
  constructor(private readonly deleteRoleUseCase: DeleteRoleUseCase) {}

  @Delete(rolesRoutes.role.delete)
  @ApiOperation({ summary: 'Supprimer un rôle' })
  async delete(@Param('id') id: string) {
    return this.deleteRoleUseCase.execute(id);
  }
}
