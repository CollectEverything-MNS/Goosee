import { Injectable, NotFoundException } from '@nestjs/common';
import { IPageRepository } from '../../repositories/page.repository';
import { Page } from '../../entities/page.entity';

@Injectable()
export class GetPageBySlugUseCase {
  constructor(private readonly pageRepository: IPageRepository) {}

  async execute(slug: string): Promise<Page> {
    const page = await this.pageRepository.findBySlug(slug);

    if (!page) {
      throw new NotFoundException('Page not found');
    }

    return page;
  }
}
