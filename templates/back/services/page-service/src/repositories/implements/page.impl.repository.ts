import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Page } from '../../entities/page.entity';
import { IPageRepository } from '../page.repository';

@Injectable()
export class TypeOrmPageRepository extends IPageRepository {
  constructor(
    @InjectRepository(Page)
    private readonly pageRepository: Repository<Page>,
  ) {
    super();
  }

  async create(page: Partial<Page>): Promise<Page> {
    const newPage = this.pageRepository.create(page);
    return this.pageRepository.save(newPage);
  }

  async findAll(): Promise<Page[]> {
    return this.pageRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: string): Promise<Page | null> {
    return this.pageRepository.findOne({ where: { id } });
  }

  async findBySlug(slug: string): Promise<Page | null> {
    return this.pageRepository.findOne({ where: { slug } });
  }

  async update(id: string, page: Partial<Page>): Promise<Page | null> {
    await this.pageRepository.update(id, page);
    return this.findById(id);
  }

  async delete(id: string): Promise<void> {
    await this.pageRepository.softDelete(id);
  }
}
