import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { InternalTokenGuard } from '../../shared/internal-token.guard';
import { RgpdEraseUseCase } from './rgpd-erase.usecase';
import { RgpdEraseDto } from './rgpd-erase.dto';

@Controller('internal/rgpd')
@UseGuards(InternalTokenGuard)
export class RgpdEraseController {
  constructor(private readonly rgpdErase: RgpdEraseUseCase) {}

  @Post('erase')
  async erase(@Body() body: RgpdEraseDto) {
    return this.rgpdErase.execute(body.customerId);
  }
}
