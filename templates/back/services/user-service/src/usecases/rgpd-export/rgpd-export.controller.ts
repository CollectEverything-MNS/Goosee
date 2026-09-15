import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { InternalTokenGuard } from '../../shared/internal-token.guard';
import { RgpdExportUseCase } from './rgpd-export.usecase';
import { RgpdExportDto } from './rgpd-export.dto';

@Controller('internal/rgpd')
@UseGuards(InternalTokenGuard)
export class RgpdExportController {
  constructor(private readonly rgpdExport: RgpdExportUseCase) {}

  @Get('export')
  async export(@Query() query: RgpdExportDto) {
    return this.rgpdExport.execute(query.customerId);
  }
}
