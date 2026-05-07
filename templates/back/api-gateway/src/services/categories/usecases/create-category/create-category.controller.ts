import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { HttpProxyService } from 'src/shared/services/http-proxy.service';
import { serviceUrl, ServiceUrls } from 'src/config/services.config';
import { routesConfig } from 'src/config/routes.config';
import { JwtAuthGuard } from 'src/shared/services/jwt-auth.guard';
import { RolesGuard } from 'src/shared/services/roles.guard';
import { Roles } from 'src/shared/services/roles.decorator';
import { CreateCategoryDto } from './create-category.dto';

@ApiTags('Categories')
@Controller()
export class CreateCategoryController {
  private readonly services: ServiceUrls;

  constructor(
    private readonly httpProxy: HttpProxyService,
    private readonly config: ConfigService
  ) {
    this.services = serviceUrl(this.config);
  }

  @Post(routesConfig.category.createCategory.path)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('categories')
  @ApiOperation({ summary: "Création d'une catégorie" })
  async create(@Body() dto: CreateCategoryDto) {
    const url = routesConfig.category.createCategory.link(this.services.product);
    return this.httpProxy.post(url, dto, 'Create category failed');
  }
}
