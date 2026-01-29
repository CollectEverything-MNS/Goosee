import { Injectable } from '@nestjs/common';
import { IMenuRepository } from '../../repositories/menu.repository';
import { Menu } from '../../entities/menu.entity';

export interface MenuWithChildren extends Menu {
  children?: MenuWithChildren[];
}

@Injectable()
export class GetMenusUseCase {
  constructor(private readonly menuRepository: IMenuRepository) {}

  async execute(): Promise<MenuWithChildren[]> {
    const allMenus = await this.menuRepository.findAll();

    const menuMap = new Map<string, MenuWithChildren>();
    const rootMenus: MenuWithChildren[] = [];

    allMenus.forEach((menu) => {
      menuMap.set(menu.id, { ...menu, children: [] });
    });

    allMenus.forEach((menu) => {
      const menuWithChildren = menuMap.get(menu.id)!;
      if (menu.parentId && menuMap.has(menu.parentId)) {
        const parent = menuMap.get(menu.parentId)!;
        parent.children = parent.children || [];
        parent.children.push(menuWithChildren);
      } else {
        rootMenus.push(menuWithChildren);
      }
    });

    return rootMenus;
  }
}
