import { Controller, Delete, Param, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { HttpProxyService } from 'src/shared/services/http-proxy.service';
import { serviceUrl, ServiceUrls } from 'src/config/services.config';
import { routesConfig } from 'src/config/routes.config';
import { JwtAuthGuard } from 'src/shared/services/jwt-auth.guard';
import { RolesGuard } from 'src/shared/services/roles.guard';
import { Roles } from 'src/shared/services/roles.decorator';

@ApiTags('Tags')
@Controller()
export class DeleteTagController {
  private readonly services: ServiceUrls;

  constructor(
    private readonly httpProxy: HttpProxyService,
    private readonly config: ConfigService
  ) {
    this.services = serviceUrl(this.config);
  }

  @Delete(routesConfig.tag.deleteTag.path)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('products')
  @ApiOperation({ summary: "Suppression d'un tag" })
  async delete(@Param('id') id: string) {
    const url = routesConfig.tag.deleteTag.link(this.services.product, id);
    return this.httpProxy.delete(url, 'Delete tag failed');
  }
}
