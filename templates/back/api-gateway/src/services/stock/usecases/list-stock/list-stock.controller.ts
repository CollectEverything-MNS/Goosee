import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { routesConfig } from '../../../../config/routes.config';
import { serviceUrl, ServiceUrls } from 'src/config/services.config';
import { HttpProxyService } from 'src/shared/services/http-proxy.service';
import { JwtAuthGuard } from 'src/shared/services/jwt-auth.guard';
import { RolesGuard } from 'src/shared/services/roles.guard';
import { Roles } from 'src/shared/services/roles.decorator';

@ApiTags('Stock')
@Controller()
export class ListStockController {
  private readonly services: ServiceUrls;

  constructor(
    private readonly httpProxy: HttpProxyService,
    private readonly config: ConfigService
  ) {
    this.services = serviceUrl(this.config);
  }

  @Get(routesConfig.stock.listStock.path)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('stock')
  @ApiOperation({ summary: 'Lister le stock de tous les produits' })
  async list() {
    const url = routesConfig.stock.listStock.link(this.services.stock);
    return this.httpProxy.get(url, 'List stock failed');
  }
}
