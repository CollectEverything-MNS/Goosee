import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ITagRepository } from '../tag.repository';
import { Tag } from '../../entities/tag.entity';

@Injectable()
export class TypeOrmTagRepository implements ITagRepository {
  constructor(
    @InjectRepository(Tag)
    private readonly repository: Repository<Tag>
  ) {}

  async save(tag: Tag): Promise<Tag> {
    return this.repository.save(tag);
  }

  async findById(id: string): Promise<Tag | null> {
    return this.repository.findOne({ where: { id } });
  }

  async findBySlug(slug: string): Promise<Tag | null> {
    return this.repository.findOne({ where: { slug } });
  }

  async list(): Promise<Tag[]> {
    return this.repository.find({ order: { name: 'ASC' } });
  }

  async findByProductId(productId: string): Promise<Tag[]> {
    return this.repository
      .createQueryBuilder('tag')
      .innerJoin('product_tag', 'pt', 'pt.tagId = tag.id::text')
      .where('pt.productId = :productId', { productId })
      .orderBy('tag.name', 'ASC')
      .getMany();
  }

  async deleteById(id: string): Promise<void> {
    await this.repository.delete({ id });
  }
}
