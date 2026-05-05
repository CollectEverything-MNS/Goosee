import { Injectable, NotFoundException } from '@nestjs/common';
import { ITagRepository } from '../../repositories/tag.repository';

@Injectable()
export class GetTagUseCase {
  constructor(private readonly tagRepo: ITagRepository) {}

  async execute(id: string) {
    const tag = await this.tagRepo.findById(id);

    if (!tag) {
      throw new NotFoundException('Tag not found');
    }

    return {
      message: 'Tag fetched successfully',
      tag,
    };
  }
}
