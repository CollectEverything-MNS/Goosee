import { Injectable, NotFoundException } from '@nestjs/common';
import { IMenuRepository } from '../../repositories/menu.repository';
import { UpdateMenuDto } from './update-menu.dto';
import { Menu } from '../../entities/menu.entity';

@Injectable()
export class UpdateMenuUseCase {
  constructor(private readonly menuRepository: IMenuRepository) {}

  async execute(id: string, dto: UpdateMenuDto): Promise<Menu> {
    const menu = await this.menuRepository.findById(id);

    if (!menu) {
      throw new NotFoundException('Menu not found');
    }

    if (dto.parentId && dto.parentId !== menu.parentId) {
      const parent = await this.menuRepository.findById(dto.parentId);
      if (!parent) {
        throw new NotFoundException('Parent menu not found');
      }
    }

    const updatedMenu = await this.menuRepository.update(id, dto);

    if (!updatedMenu) {
      throw new NotFoundException('Menu not found');
    }

    return updatedMenu;
  }
}
