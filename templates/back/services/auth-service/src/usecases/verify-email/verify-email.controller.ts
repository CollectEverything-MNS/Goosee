import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { VerifyEmailUseCase } from './verify-email.usecase';
import { authRoutes } from '../../config/routes.config';

@Controller(authRoutes.root)
export class VerifyEmailController {
  constructor(private readonly verifyEmailUseCase: VerifyEmailUseCase) {}

  @Get(authRoutes.auth.verifyEmail)
  async verify(@Query('token') token?: string) {
    if (!token) {
      throw new BadRequestException('Token is required');
    }
    return this.verifyEmailUseCase.execute(token);
  }
}
