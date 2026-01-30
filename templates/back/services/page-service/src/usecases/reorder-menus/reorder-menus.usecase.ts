import { Injectable } from '@nestjs/common';
import { IMenuRepository } from '../../repositories/menu.repository';
import { ReorderMenusDto } from './reorder-menus.dto';

@Injectable()
export class ReorderMenusUseCase {
  constructor(private readonly menuRepository: IMenuRepository) {}

  async execute(dto: ReorderMenusDto): Promise<void> {
    await this.menuRepository.reorder(dto.items);
  }
}
