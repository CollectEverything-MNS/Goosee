import { Controller, Get } from '@nestjs/common';
import { ListAdminsUseCase } from './list-admins.usecase';
import { usersRoutes } from '../../config/routes.config';
import { ApiOperation } from '@nestjs/swagger';

@Controller()
export class ListAdminsController {
  constructor(private readonly listAdminsUseCase: ListAdminsUseCase) {}

  @Get(`${usersRoutes.root}/admins`)
  @ApiOperation({ summary: 'Liste des administrateurs (ADMIN et OWNER)' })
  async getAdmins() {
    return this.listAdminsUseCase.execute();
  }
}
