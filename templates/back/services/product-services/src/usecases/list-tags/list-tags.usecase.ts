import { Injectable } from '@nestjs/common';
import { ITagRepository } from '../../repositories/tag.repository';

@Injectable()
export class ListTagsUseCase {
  constructor(private readonly tagRepo: ITagRepository) {}

  async execute() {
    const tags = await this.tagRepo.list();

    return {
      message: 'Tags fetched successfully',
      tags,
    };
  }
}
