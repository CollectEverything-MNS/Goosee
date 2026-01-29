import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import * as FormData from 'form-data';

@Injectable()
export class UploadService {
  private readonly pageServiceUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService
  ) {
    const host = this.configService.get<string>('PAGE_SERVICE_HOST');
    const port = this.configService.get<string>('PAGE_SERVICE_PORT');
    this.pageServiceUrl = `http://${host}:${port}`;
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
    const url = `${this.pageServiceUrl}/upload${queryParams}`;

    const response = await firstValueFrom(
      this.httpService.post<{ url: string; key: string }>(url, formData, {
        headers: {
          ...formData.getHeaders(),
        },
      })
    );

    return response.data;
  }
}
