import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { Menu } from '../../entities/menu.entity';
import { IMenuRepository } from '../menu.repository';

@Injectable()
export class TypeOrmMenuRepository extends IMenuRepository {
  constructor(
    @InjectRepository(Menu)
    private readonly menuRepository: Repository<Menu>
  ) {
    super();
  }

  async create(menu: Partial<Menu>): Promise<Menu> {
    const newMenu = this.menuRepository.create(menu);
    return this.menuRepository.save(newMenu);
  }

  async findAll(): Promise<Menu[]> {
    return this.menuRepository.find({
      order: { order: 'ASC' },
    });
  }

  async findById(id: string): Promise<Menu | null> {
    return this.menuRepository.findOne({ where: { id } });
  }

  async findByParentId(parentId: string | null): Promise<Menu[]> {
    return this.menuRepository.find({
      where: { parentId: parentId === null ? IsNull() : parentId },
      order: { order: 'ASC' },
    });
  }

  async update(id: string, menu: Partial<Menu>): Promise<Menu | null> {
    const existingMenu = await this.findById(id);
    if (!existingMenu) {
      return null;
    }
    const updatedMenu = this.menuRepository.merge(existingMenu, menu);
    return this.menuRepository.save(updatedMenu);
  }

  async delete(id: string): Promise<void> {
    await this.menuRepository.softDelete(id);
  }

  async reorder(items: { id: string; order: number }[]): Promise<void> {
    await Promise.all(
      items.map((item) =>
        this.menuRepository.update(item.id, { order: item.order })
      )
    );
  }
}
