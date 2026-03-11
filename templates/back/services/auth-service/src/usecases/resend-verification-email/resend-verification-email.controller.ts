import { Body, Controller, Post } from '@nestjs/common';
import { authRoutes } from '../../config/routes.config';
import { ResendVerificationEmailDto } from './resend-verification-email.dto';
import { ResendVerificationEmailUseCase } from './resend-verification-email.usecase';

@Controller(authRoutes.root)
export class ResendVerificationEmailController {
  constructor(private readonly useCase: ResendVerificationEmailUseCase) {}

  @Post(authRoutes.auth.resendVerificationEmail)
  async resend(@Body() dto: ResendVerificationEmailDto) {
    return this.useCase.execute(dto.email);
  }
}
