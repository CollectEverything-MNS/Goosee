import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';

import { ICategoryRepository } from '../../repositories/category.repository';
import { CreateCategoryDto } from './create-category.dto';
import { Category } from '../../entities/category.entity';
import { LogClient } from '../../services/log-client.service';

@Injectable()
export class CreateCategoryUseCase {
  constructor(
    private readonly categoryRepo: ICategoryRepository,
    private readonly logClient: LogClient,
  ) {}

  async execute(dto: CreateCategoryDto) {
    if (dto.parentId) {
      const parent = await this.categoryRepo.findById(dto.parentId);

      if (!parent) {
        throw new NotFoundException(`Catégorie parente introuvable : ${dto.parentId}`);
      }

      if (parent.parentId) {
        this.logClient.warning({
          message: `Tentative de création d'une catégorie sur 3 niveaux refusée`,
        });
        throw new BadRequestException(
          'Une sous-catégorie ne peut pas avoir de sous-catégorie (max 2 niveaux)',
        );
      }
    }

    const category = new Category({
      name: dto.name,
      description: dto.description ?? null,
      imageUrl: dto.imageUrl ?? null,
      parentId: dto.parentId ?? null,
      order: dto.order ?? 0,
      isActive: dto.isActive ?? true,
    });

    const saved = await this.categoryRepo.save(category);

    this.logClient.success({
      message: `Catégorie créée : ${saved.name}`,
    });

    return {
      message: 'Category created successfully',
      category: saved,
    };
  }
}