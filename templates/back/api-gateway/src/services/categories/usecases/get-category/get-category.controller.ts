import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { HttpProxyService } from 'src/shared/services/http-proxy.service';
import { serviceUrl, ServiceUrls } from 'src/config/services.config';
import { routesConfig } from 'src/config/routes.config';

@ApiTags('Categories')
@Controller()
export class GetCategoryController {
  private readonly services: ServiceUrls;

  constructor(
    private readonly httpProxy: HttpProxyService,
    private readonly config: ConfigService
  ) {
    this.services = serviceUrl(this.config);
  }

  @Get(routesConfig.category.getCategory.path)
  @ApiOperation({ summary: "Récupération d'une catégorie" })
  async get(@Param('id') id: string) {
    const url = routesConfig.category.getCategory.link(this.services.product, id);
    return this.httpProxy.get(url, 'Get category failed');
  }
}
