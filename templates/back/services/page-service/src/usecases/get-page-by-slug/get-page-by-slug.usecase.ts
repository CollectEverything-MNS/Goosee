import { Injectable, NotFoundException } from '@nestjs/common';
import { IPageRepository } from '../../repositories/page.repository';
import { Page, PageStatus } from '../../entities/page.entity';

@Injectable()
export class GetPageBySlugUseCase {
  constructor(private readonly pageRepository: IPageRepository) {}

  async execute(slug: string): Promise<Page> {
    const page = await this.pageRepository.findBySlug(slug);

    if (!page) {
      throw new NotFoundException('Page not found');
    }

    // Only return published pages for public access
    if (page.status !== PageStatus.PUBLISHED) {
      throw new NotFoundException('Page not found');
    }

    return page;
  }
}
