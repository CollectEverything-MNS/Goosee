import { BadRequestException, Injectable } from '@nestjs/common';
import { ITagRepository } from '../../repositories/tag.repository';
import { CreateTagDto } from './create-tag.dto';
import { Tag } from '../../entities/tag.entity';
import { generateSlug } from '../../shared/slug.utils';
import { LogClient } from '../../services/log-client.service';

@Injectable()
export class CreateTagUseCase {
  constructor(
    private readonly tagRepo: ITagRepository,
    private readonly logClient: LogClient
  ) {}

  async execute(dto: CreateTagDto) {
    const slug = generateSlug(dto.name);

    const existing = await this.tagRepo.findBySlug(slug);
    if (existing) {
      this.logClient.warning({
        message: `Tentative de création d'un tag déjà existant : ${slug}`,
      });
      throw new BadRequestException(`Tag already exists : ${slug}`);
    }

    const tag = new Tag({
      name: dto.name.trim(),
      slug,
    });

    const saved = await this.tagRepo.save(tag);

    this.logClient.success({
      message: `Tag créé : ${saved.name} (${saved.slug})`,
    });

    return {
      message: 'Tag created successfully',
      tag: saved,
    };
  }
}
