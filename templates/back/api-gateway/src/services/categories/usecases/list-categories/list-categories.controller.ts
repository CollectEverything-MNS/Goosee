import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { HttpProxyService } from 'src/shared/services/http-proxy.service';
import { serviceUrl, ServiceUrls } from 'src/config/services.config';
import { routesConfig } from 'src/config/routes.config';

@ApiTags('Categories')
@Controller()
export class ListCategoriesController {
  private readonly services: ServiceUrls;

  constructor(
    private readonly httpProxy: HttpProxyService,
    private readonly config: ConfigService
  ) {
    this.services = serviceUrl(this.config);
  }

  @Get(routesConfig.category.listCategories.path)
  @ApiOperation({ summary: 'Liste des catégories' })
  async list() {
    const url = routesConfig.category.listCategories.link(this.services.product);
    return this.httpProxy.get(url, 'List categories failed');
  }
}
