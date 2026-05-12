import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { routesConfig } from '../../../../config/routes.config';
import { serviceUrl, ServiceUrls } from 'src/config/services.config';
import { HttpProxyService } from 'src/shared/services/http-proxy.service';

@ApiTags('Log')
@Controller()
export class ListLogsController {
  private readonly services: ServiceUrls;

  constructor(
    private readonly httpProxy: HttpProxyService,
    private readonly config: ConfigService,
  ) {
    this.services = serviceUrl(this.config);
  }

  @Get(routesConfig.log.listLogs.path)
  @ApiOperation({ summary: 'Liste des logs applicatifs' })
  async list() {
    const url = routesConfig.log.listLogs.link(this.services.log);
    return this.httpProxy.get(url, 'List logs failed');
  }
}
