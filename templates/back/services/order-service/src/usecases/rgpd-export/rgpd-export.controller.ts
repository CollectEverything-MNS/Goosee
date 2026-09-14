import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { InternalTokenGuard } from '../../shared/internal-token.guard';
import { RgpdExportUseCase } from './rgpd-export.usecase';

@Controller('internal/rgpd')
@UseGuards(InternalTokenGuard)
export class RgpdExportController {
  constructor(private readonly rgpdExport: RgpdExportUseCase) {}

  @Get('export')
  async export(@Query('customerId') customerId: string) {
    return this.rgpdExport.execute(customerId);
  }
}
