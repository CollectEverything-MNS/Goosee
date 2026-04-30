import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';

import { ICategoryRepository } from '../../repositories/category.repository';
import { UpdateCategoryDto } from './update-category.dto';
import { LogClient } from '../../shared/log-client.service';

@Injectable()
export class UpdateCategoryUseCase {
  constructor(
    private readonly categoryRepo: ICategoryRepository,
    private readonly logClient: LogClient
  ) {}

  async execute(id: string, dto: UpdateCategoryDto) {
    const category = await this.categoryRepo.findById(id);

    if (!category) {
      this.logClient.warning({
        message: `Tentative de mise à jour d'une catégorie introuvable : ${id}`,
      });
      throw new NotFoundException('Category not found');
    }

    if (dto.parentId && dto.parentId !== category.parentId) {
      const parent = await this.categoryRepo.findById(dto.parentId);

      if (!parent) {
        throw new NotFoundException(`Catégorie parente introuvable : ${dto.parentId}`);
      }

      if (parent.parentId) {
        throw new BadRequestException(
          'Une sous-catégorie ne peut pas avoir de sous-catégorie (max 2 niveaux)'
        );
      }
    }

    const isDeactivating = dto.isActive === false && category.isActive === true;
    const isRoot = !category.parentId;

    if (isDeactivating && isRoot) {
      const children = await this.categoryRepo.listByParentId(id);
      for (const child of children) {
        child.isActive = false;
        await this.categoryRepo.save(child);
      }
    }

    const updated = {
      ...category,
      name: dto.name ?? category.name,
      description: dto.description ?? category.description,
      imageUrl: dto.imageUrl ?? category.imageUrl,
      parentId: dto.parentId ?? category.parentId,
      order: dto.order ?? category.order,
      isActive: dto.isActive ?? category.isActive,
    };

    const saved = await this.categoryRepo.save(updated);

    this.logClient.success({
      message: `Catégorie mise à jour : ${saved.name}`,
    });

    return {
      message: 'Category updated successfully',
      category: saved,
    };
  }
}
