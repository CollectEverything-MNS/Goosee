import { Body, Controller, Post } from '@nestjs/common';
import { RevokeTokenUseCase } from './revoke-token.usecase';
import { RevokeTokenDto } from './revoke-token.dto';

@Controller('auth/token')
export class RevokeTokenController {
  constructor(private readonly revokeTokenUseCase: RevokeTokenUseCase) {}

  @Post('revoke')
  async revoke(@Body() dto: RevokeTokenDto) {
    return this.revokeTokenUseCase.execute(dto);
  }
}
