import { Body, Controller, Post } from '@nestjs/common';
import { RefreshTokenUseCase } from './refresh-token.usecase';
import { RefreshTokenDto } from './refresh-token.dto';

@Controller('auth/token')
export class RefreshTokenController {
  constructor(private readonly refreshTokenUseCase: RefreshTokenUseCase) {}

  @Post('refresh')
  async refresh(@Body() dto: RefreshTokenDto) {
    return this.refreshTokenUseCase.execute(dto);
  }
}
