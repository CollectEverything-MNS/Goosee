import { Controller, Get, Param } from '@nestjs/common';
import { authRoutes } from '../../config/routes.config';
import { GetTokenVersionUseCase } from './get-token-version.usecase';

@Controller(authRoutes.root)
export class GetTokenVersionController {
  constructor(private readonly getTokenVersionUseCase: GetTokenVersionUseCase) {}

  @Get(authRoutes.auth.tokenVersion)
  async getTokenVersion(@Param('authId') authId: string) {
    return this.getTokenVersionUseCase.execute(authId);
  }
}
