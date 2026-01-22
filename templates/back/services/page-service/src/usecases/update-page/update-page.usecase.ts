import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { IPageRepository } from '../../repositories/page.repository';
import { UpdatePageDto } from './update-page.dto';
import { Page } from '../../entities/page.entity';

@Injectable()
export class UpdatePageUseCase {
  constructor(private readonly pageRepository: IPageRepository) {}

  async execute(id: string, dto: UpdatePageDto): Promise<Page> {
    const page = await this.pageRepository.findById(id);

    if (!page) {
      throw new NotFoundException('Page not found');
    }

    if (dto.slug && dto.slug !== page.slug) {
      const existingPage = await this.pageRepository.findBySlug(dto.slug);
      if (existingPage) {
        throw new ConflictException('A page with this slug already exists');
      }
    }

    const updatedPage = await this.pageRepository.update(id, dto);

    if (!updatedPage) {
      throw new NotFoundException('Page not found');
    }

    return updatedPage;
  }
}
