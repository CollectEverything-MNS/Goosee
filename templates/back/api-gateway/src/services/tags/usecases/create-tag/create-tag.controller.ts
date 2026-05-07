import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { HttpProxyService } from 'src/shared/services/http-proxy.service';
import { serviceUrl, ServiceUrls } from 'src/config/services.config';
import { routesConfig } from 'src/config/routes.config';
import { JwtAuthGuard } from 'src/shared/services/jwt-auth.guard';
import { RolesGuard } from 'src/shared/services/roles.guard';
import { Roles } from 'src/shared/services/roles.decorator';
import { CreateTagDto } from './create-tag.dto';

@ApiTags('Tags')
@Controller()
export class CreateTagController {
  private readonly services: ServiceUrls;

  constructor(
    private readonly httpProxy: HttpProxyService,
    private readonly config: ConfigService
  ) {
    this.services = serviceUrl(this.config);
  }

  @Post(routesConfig.tag.createTag.path)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('products')
  @ApiOperation({ summary: "Création d'un tag" })
  async create(@Body() dto: CreateTagDto) {
    const url = routesConfig.tag.createTag.link(this.services.product);
    return this.httpProxy.post(url, dto, 'Create tag failed');
  }
}
