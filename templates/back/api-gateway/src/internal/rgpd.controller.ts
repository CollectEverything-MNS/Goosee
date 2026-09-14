import { Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { InternalTokenGuard } from '../shared/internal-token.guard';
import { RgpdService } from '../services/rgpd/rgpd.service';

@Controller('internal/rgpd')
@UseGuards(InternalTokenGuard)
export class RgpdController {
  constructor(private readonly rgpdService: RgpdService) {}

  @Post('erase/:customerId')
  async erase(@Param('customerId') customerId: string) {
    return this.rgpdService.erase(customerId);
  }

  @Get('export/:customerId')
  async export(@Param('customerId') customerId: string) {
    return this.rgpdService.export(customerId);
  }
}
