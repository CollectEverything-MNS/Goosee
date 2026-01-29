import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { IMenuRepository } from '../../repositories/menu.repository';
import { CreateMenuDto } from './create-menu.dto';
import { Menu } from '../../entities/menu.entity';

@Injectable()
export class CreateMenuUseCase {
  constructor(private readonly menuRepository: IMenuRepository) {}

  async execute(dto: CreateMenuDto): Promise<Menu> {
    if (!dto.pageId && !dto.externalUrl) {
      throw new BadRequestException('Either pageId or externalUrl must be provided');
    }

    if (dto.parentId) {
      const parent = await this.menuRepository.findById(dto.parentId);
      if (!parent) {
        throw new NotFoundException('Parent menu not found');
      }
    }

    const siblings = await this.menuRepository.findByParentId(dto.parentId || null);
    const maxOrder = siblings.length > 0 ? Math.max(...siblings.map((m) => m.order)) : -1;

    return this.menuRepository.create({
      ...dto,
      order: dto.order ?? maxOrder + 1,
    });
  }
}
