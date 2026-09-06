import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { routesConfig } from '../../../../config/routes.config';
import { serviceUrl, ServiceUrls } from 'src/config/services.config';
import { HttpProxyService } from 'src/shared/services/http-proxy.service';

@ApiTags('Stock')
@Controller()
export class GetStockController {
  private readonly services: ServiceUrls;

  constructor(
    private readonly httpProxy: HttpProxyService,
    private readonly config: ConfigService
  ) {
    this.services = serviceUrl(this.config);
  }

  @Get(routesConfig.stock.getStock.path)
  @ApiOperation({ summary: "Récupérer le stock d'un produit" })
  async get(@Param('id') id: string) {
    const url = routesConfig.stock.getStock.link(this.services.stock, id);
    return this.httpProxy.get(url, 'Get stock failed');
  }
}
