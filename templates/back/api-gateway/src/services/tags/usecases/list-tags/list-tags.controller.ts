import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { HttpProxyService } from 'src/shared/services/http-proxy.service';
import { serviceUrl, ServiceUrls } from 'src/config/services.config';
import { routesConfig } from 'src/config/routes.config';

@ApiTags('Tags')
@Controller()
export class ListTagsController {
  private readonly services: ServiceUrls;

  constructor(
    private readonly httpProxy: HttpProxyService,
    private readonly config: ConfigService
  ) {
    this.services = serviceUrl(this.config);
  }

  @Get(routesConfig.tag.listTags.path)
  @ApiOperation({ summary: 'Liste des tags' })
  async list() {
    const url = routesConfig.tag.listTags.link(this.services.product);
    return this.httpProxy.get(url, 'List tags failed');
  }
}
