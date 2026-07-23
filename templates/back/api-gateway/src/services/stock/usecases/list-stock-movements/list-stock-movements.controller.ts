import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { routesConfig } from '../../../../config/routes.config';
import { serviceUrl, ServiceUrls } from 'src/config/services.config';
import { HttpProxyService } from 'src/shared/services/http-proxy.service';
import { JwtAuthGuard } from 'src/shared/services/jwt-auth.guard';
import { RolesGuard } from 'src/shared/services/roles.guard';
import { Roles } from 'src/shared/services/roles.decorator';

@ApiTags('Stock')
@Controller()
export class ListStockMovementsController {
  private readonly services: ServiceUrls;

  constructor(
    private readonly httpProxy: HttpProxyService,
    private readonly config: ConfigService
  ) {
    this.services = serviceUrl(this.config);
  }

  @Get(routesConfig.stock.listStockMovements.path)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('stock')
  @ApiBearerAuth()
  @ApiOperation({ summary: "Historique des mouvements de stock d'un produit" })
  async list(@Param('id') id: string) {
    const url = routesConfig.stock.listStockMovements.link(this.services.stock, id);
    return this.httpProxy.get(url, 'List stock movements failed');
  }
}
