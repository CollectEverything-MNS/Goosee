import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpProxyService } from '../../shared/services/http-proxy.service';
import { routesConfig } from '../../config/routes.config';
import { serviceUrl, ServiceUrls } from '../../config/services.config';
import FormData from 'form-data';

@Injectable()
export class UploadService {
  private readonly serviceUrl: ServiceUrls;

  constructor(
    private readonly httpProxy: HttpProxyService,
    private readonly configService: ConfigService
  ) {
    this.serviceUrl = serviceUrl(this.configService);
  }

  async uploadFile(
    file: Express.Multer.File,
    folder?: string
  ): Promise<{ url: string; key: string }> {
    const formData = new FormData();
    formData.append('file', file.buffer, {
      filename: file.originalname,
      contentType: file.mimetype,
    });

    const queryParams = folder ? `?folder=${folder}` : '';
    const url = `${routesConfig.upload.file.link(this.serviceUrl.page)}${queryParams}`;

    return this.httpProxy.postWithConfig<{ url: string; key: string }>(
      url,
      formData,
      { headers: { ...formData.getHeaders() } },
      'Failed to upload file'
    );
  }
}
