import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpProxyService } from '../../shared/services/http-proxy.service';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { ReorderMenusDto } from './dto/reorder-menus.dto';

@Injectable()
export class MenusService {
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
    return this.httpProxy.get(`${this.pageServiceUrl}/menus`, 'Failed to fetch menus');
  }

  async create(dto: CreateMenuDto) {
    return this.httpProxy.post(`${this.pageServiceUrl}/menus`, dto, 'Failed to create menu');
  }

  async update(id: string, dto: UpdateMenuDto) {
    return this.httpProxy.put(`${this.pageServiceUrl}/menus/${id}`, dto, 'Failed to update menu');
  }

  async delete(id: string) {
    return this.httpProxy.delete(`${this.pageServiceUrl}/menus/${id}`, 'Failed to delete menu');
  }

  async reorder(dto: ReorderMenusDto) {
    return this.httpProxy.put(`${this.pageServiceUrl}/menus/reorder`, dto, 'Failed to reorder menus');
  }
}
