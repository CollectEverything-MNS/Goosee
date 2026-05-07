import {
  BadRequestException,
  Controller,
  Param,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { HttpProxyService } from 'src/shared/services/http-proxy.service';
import { serviceUrl, ServiceUrls } from 'src/config/services.config';
import { routesConfig } from 'src/config/routes.config';
import { JwtAuthGuard } from 'src/shared/services/jwt-auth.guard';
import { RolesGuard } from 'src/shared/services/roles.guard';
import { Roles } from 'src/shared/services/roles.decorator';
import FormData from 'form-data';

@ApiTags('Products')
@Controller()
export class AddProductImageController {
  private readonly services: ServiceUrls;

  constructor(
    private readonly httpProxy: HttpProxyService,
    private readonly config: ConfigService
  ) {
    this.services = serviceUrl(this.config);
  }

  @Post(routesConfig.product.addImage.path)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('products')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
    },
  })
  @ApiOperation({ summary: "Ajout d'une image à un produit" })
  async addImage(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Query('isMain') isMain?: string
  ) {
    if (!file) throw new BadRequestException('No file provided');

    const formData = new FormData();
    formData.append('file', file.buffer, {
      filename: file.originalname,
      contentType: file.mimetype,
    });

    const queryParams = isMain ? `?isMain=${isMain}` : '';
    const url = `${routesConfig.product.addImage.link(this.services.product, id)}${queryParams}`;

    return this.httpProxy.postWithConfig(
      url,
      formData,
      { headers: { ...formData.getHeaders() } },
      'Add product image failed'
    );
  }
}
