import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { IPageRepository } from '../../repositories/page.repository';
import { UpdatePageDto } from './update-page.dto';
import { Page, PageType } from '../../entities/page.entity';

const UNIQUE_PAGE_TYPES = [PageType.HOME, PageType.CATALOG, PageType.CONTACT];

@Injectable()
export class UpdatePageUseCase {
  constructor(private readonly pageRepository: IPageRepository) {}

  async execute(id: string, dto: UpdatePageDto): Promise<Page> {
    const page = await this.pageRepository.findById(id);

    if (!page) {
      throw new NotFoundException('Page not found');
    }

    // Check for duplicate slug
    if (dto.slug && dto.slug !== page.slug) {
      const existingPage = await this.pageRepository.findBySlug(dto.slug);
      if (existingPage) {
        throw new ConflictException('SLUG_ALREADY_EXISTS');
      }
    }

    // Check for unique page types (home, catalog, contact can only exist once)
    if (dto.type && dto.type !== page.type && UNIQUE_PAGE_TYPES.includes(dto.type)) {
      const existingTypePage = await this.pageRepository.findByType(dto.type);
      if (existingTypePage) {
        throw new ConflictException('PAGE_TYPE_ALREADY_EXISTS');
      }
    }

    const updatedPage = await this.pageRepository.update(id, dto);

    if (!updatedPage) {
      throw new NotFoundException('Page not found');
    }

    return updatedPage;
  }
}
