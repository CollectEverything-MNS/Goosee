import { Injectable, NotFoundException } from '@nestjs/common';
import { IMenuRepository } from '../../repositories/menu.repository';

@Injectable()
export class DeleteMenuUseCase {
  constructor(private readonly menuRepository: IMenuRepository) {}

  async execute(id: string): Promise<void> {
    const menu = await this.menuRepository.findById(id);

    if (!menu) {
      throw new NotFoundException('Menu not found');
    }

    const children = await this.menuRepository.findByParentId(id);
    for (const child of children) {
      await this.menuRepository.delete(child.id);
    }

    await this.menuRepository.delete(id);
  }
}
