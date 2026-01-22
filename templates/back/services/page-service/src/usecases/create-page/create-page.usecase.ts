import { ConflictException, Injectable } from '@nestjs/common';
import { IPageRepository } from '../../repositories/page.repository';
import { CreatePageDto } from './create-page.dto';
import { Page } from '../../entities/page.entity';

@Injectable()
export class CreatePageUseCase {
  constructor(private readonly pageRepository: IPageRepository) {}

  async execute(dto: CreatePageDto): Promise<Page> {
    const existingPage = await this.pageRepository.findBySlug(dto.slug);

    if (existingPage) {
      throw new ConflictException('A page with this slug already exists');
    }

    return this.pageRepository.create(dto);
  }
}
