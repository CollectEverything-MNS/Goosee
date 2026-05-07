import { Body, Controller, Param, Patch, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { HttpProxyService } from 'src/shared/services/http-proxy.service';
import { serviceUrl, ServiceUrls } from 'src/config/services.config';
import { routesConfig } from 'src/config/routes.config';
import { JwtAuthGuard } from 'src/shared/services/jwt-auth.guard';
import { RolesGuard } from 'src/shared/services/roles.guard';
import { Roles } from 'src/shared/services/roles.decorator';
import { UpdateCategoryDto } from './update-category.dto';

@ApiTags('Categories')
@Controller()
export class UpdateCategoryController {
  private readonly services: ServiceUrls;

  constructor(
    private readonly httpProxy: HttpProxyService,
    private readonly config: ConfigService
  ) {
    this.services = serviceUrl(this.config);
  }

  @Patch(routesConfig.category.updateCategory.path)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('categories')
  @ApiOperation({ summary: "Mise à jour d'une catégorie" })
  async update(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    const url = routesConfig.category.updateCategory.link(this.services.product, id);
    return this.httpProxy.patch(url, dto, 'Update category failed');
  }
}
