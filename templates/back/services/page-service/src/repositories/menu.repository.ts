import { Menu } from '../entities/menu.entity';

export abstract class IMenuRepository {
  abstract create(menu: Partial<Menu>): Promise<Menu>;
  abstract findAll(): Promise<Menu[]>;
  abstract findById(id: string): Promise<Menu | null>;
  abstract findByParentId(parentId: string | null): Promise<Menu[]>;
  abstract update(id: string, menu: Partial<Menu>): Promise<Menu | null>;
  abstract delete(id: string): Promise<void>;
  abstract reorder(items: { id: string; order: number }[]): Promise<void>;
}
