import { Controller, Get, Param } from '@nestjs/common';
import { GetUserByAuthUseCase } from './get-user-by-auth.usecase';
import { usersRoutes } from '../../config/routes.config';
import { ApiOperation } from '@nestjs/swagger';

@Controller(usersRoutes.root)
export class GetUserByAuthController {
  constructor(private readonly getUserByAuthUseCase: GetUserByAuthUseCase) {}

  @Get('/by-auth/:authId')
  @ApiOperation({ summary: 'Get un utilisateur par authId' })
  async getUserByAuth(@Param('authId') authId: string) {
    return this.getUserByAuthUseCase.execute(authId);
  }
}
