import { Controller, Delete, Param, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { HttpProxyService } from 'src/shared/services/http-proxy.service';
import { serviceUrl, ServiceUrls } from 'src/config/services.config';
import { routesConfig } from 'src/config/routes.config';
import { JwtAuthGuard } from 'src/shared/services/jwt-auth.guard';
import { RolesGuard } from 'src/shared/services/roles.guard';
import { Roles } from 'src/shared/services/roles.decorator';

@ApiTags('Categories')
@Controller()
export class DeleteCategoryController {
  private readonly services: ServiceUrls;

  constructor(
    private readonly httpProxy: HttpProxyService,
    private readonly config: ConfigService
  ) {
    this.services = serviceUrl(this.config);
  }

  @Delete(routesConfig.category.deleteCategory.path)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('categories')
  @ApiOperation({ summary: "Suppression d'une catégorie" })
  async delete(@Param('id') id: string) {
    const url = routesConfig.category.deleteCategory.link(this.services.product, id);
    return this.httpProxy.delete(url, 'Delete category failed');
  }
}
