import { Injectable, NotFoundException } from '@nestjs/common';
import { IPageRepository } from '../../repositories/page.repository';
import { Page } from '../../entities/page.entity';

@Injectable()
export class GetPageUseCase {
  constructor(private readonly pageRepository: IPageRepository) {}

  async execute(id: string): Promise<Page> {
    const page = await this.pageRepository.findById(id);

    if (!page) {
      throw new NotFoundException('Page not found');
    }

    return page;
  }
}
