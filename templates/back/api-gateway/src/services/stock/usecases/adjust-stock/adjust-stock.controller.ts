import { Body, Controller, Param, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { routesConfig } from '../../../../config/routes.config';
import { serviceUrl, ServiceUrls } from 'src/config/services.config';
import { HttpProxyService } from 'src/shared/services/http-proxy.service';
import { JwtAuthGuard } from 'src/shared/services/jwt-auth.guard';
import { RolesGuard } from 'src/shared/services/roles.guard';
import { Roles } from 'src/shared/services/roles.decorator';
import { AdjustStockDto } from './adjust-stock.dto';

@ApiTags('Stock')
@Controller()
export class AdjustStockController {
  private readonly services: ServiceUrls;

  constructor(
    private readonly httpProxy: HttpProxyService,
    private readonly config: ConfigService
  ) {
    this.services = serviceUrl(this.config);
  }

  @Patch(routesConfig.stock.adjustStock.path)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('stock')
  @ApiBearerAuth()
  @ApiOperation({ summary: "Ajuster le stock d'un produit" })
  async adjust(@Param('id') id: string, @Body() dto: AdjustStockDto) {
    const url = routesConfig.stock.adjustStock.link(this.services.stock, id);
    return this.httpProxy.patch(url, dto, 'Adjust stock failed');
  }
}
