import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { InternalTokenGuard } from '../../shared/internal-token.guard';
import { RgpdEraseUseCase } from './rgpd-erase.usecase';

@Controller('internal/rgpd')
@UseGuards(InternalTokenGuard)
export class RgpdEraseController {
  constructor(private readonly rgpdErase: RgpdEraseUseCase) {}

  @Post('erase')
  async erase(@Body() body: { customerId: string }) {
    return this.rgpdErase.execute(body.customerId);
  }
}
