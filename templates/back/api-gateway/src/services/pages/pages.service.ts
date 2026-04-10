import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpProxyService } from '../../shared/services/http-proxy.service';
import { CreatePageDto } from './dto/create-page.dto';
import { UpdatePageDto } from './dto/update-page.dto';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { ReorderMenusDto } from './dto/reorder-menus.dto';
import { UpdateSettingsDto } from './dto/update-settings.dto';

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

  // ─── Pages ───

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

  // ─── Menus ───

  async getAllMenus() {
    return this.httpProxy.get(`${this.pageServiceUrl}/menus`, 'Failed to fetch menus');
  }

  async createMenu(dto: CreateMenuDto) {
    return this.httpProxy.post(`${this.pageServiceUrl}/menus`, dto, 'Failed to create menu');
  }

  async updateMenu(id: string, dto: UpdateMenuDto) {
    return this.httpProxy.put(`${this.pageServiceUrl}/menus/${id}`, dto, 'Failed to update menu');
  }

  async deleteMenu(id: string) {
    return this.httpProxy.delete(`${this.pageServiceUrl}/menus/${id}`, 'Failed to delete menu');
  }

  async reorderMenus(dto: ReorderMenusDto) {
    return this.httpProxy.put(`${this.pageServiceUrl}/menus/reorder`, dto, 'Failed to reorder menus');
  }

  // ─── Settings ───

  async getSettings() {
    return this.httpProxy.get(`${this.pageServiceUrl}/settings`, 'Failed to fetch settings');
  }

  async updateSettings(dto: UpdateSettingsDto) {
    return this.httpProxy.put(`${this.pageServiceUrl}/settings`, dto, 'Failed to update settings');
  }
}
