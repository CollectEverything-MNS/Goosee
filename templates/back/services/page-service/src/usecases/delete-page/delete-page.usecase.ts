import { Injectable, NotFoundException } from '@nestjs/common';
import { IPageRepository } from '../../repositories/page.repository';

@Injectable()
export class DeletePageUseCase {
  constructor(private readonly pageRepository: IPageRepository) {}

  async execute(id: string): Promise<void> {
    const page = await this.pageRepository.findById(id);

    if (!page) {
      throw new NotFoundException('Page not found');
    }

    await this.pageRepository.delete(id);
  }
}
