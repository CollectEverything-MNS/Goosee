import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { rolesRoutes } from '../../config/routes.config';
import { CreateRoleUseCase } from './create-role.usecase';
import { CreateRoleDto } from './create-role.dto';

@Controller(rolesRoutes.root)
export class CreateRoleController {
  constructor(private readonly createRoleUseCase: CreateRoleUseCase) {}

  @Post(rolesRoutes.role.create)
  @ApiOperation({ summary: 'Créer un rôle' })
  async create(@Body() dto: CreateRoleDto) {
    const role = await this.createRoleUseCase.execute(dto);
    return { message: 'Role created successfully', role };
  }
}
