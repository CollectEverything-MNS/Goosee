import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpProxyService } from '../../shared/services/http-proxy.service';
import { CreatePageDto } from './dto/create-page.dto';
import { UpdatePageDto } from './dto/update-page.dto';

@Injectable()
export class PagesService {
  private readonly pageServiceUrl: string;

  constructor(
    private readonly httpProxy: HttpProxyService,
    private readonly configService: ConfigService
  ) {
    const host = this.configService.get<string>('PAGE_SERVICE_HOST');
    const port = this.configService.get<string>('PAGE_SERVICE_PORT');
    this.pageServiceUrl = `http://${host}:${port}`;
  }

  async getAll() {
    return this.httpProxy.get(`${this.pageServiceUrl}/pages`, 'Failed to fetch pages');
  }

  async getById(id: string) {
    return this.httpProxy.get(`${this.pageServiceUrl}/pages/${id}`, 'Failed to fetch page');
  }

  async getBySlug(slug: string) {
    return this.httpProxy.get(
      `${this.pageServiceUrl}/pages/slug/${slug}`,
      'Failed to fetch page by slug'
    );
  }

  async create(dto: CreatePageDto) {
    return this.httpProxy.post(`${this.pageServiceUrl}/pages`, dto, 'Failed to create page');
  }

  async update(id: string, dto: UpdatePageDto) {
    return this.httpProxy.put(`${this.pageServiceUrl}/pages/${id}`, dto, 'Failed to update page');
  }

  async delete(id: string) {
    return this.httpProxy.delete(`${this.pageServiceUrl}/pages/${id}`, 'Failed to delete page');
  }

  async seed() {
    return this.httpProxy.post(`${this.pageServiceUrl}/pages/seed`, {}, 'Failed to seed pages');
  }
}
