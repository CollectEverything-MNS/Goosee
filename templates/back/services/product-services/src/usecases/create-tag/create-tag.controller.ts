import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { CreateTagDto } from './create-tag.dto';
import { CreateTagUseCase } from './create-tag.usecase';
import { tagsRoutes } from '../../config/routes.config';

@Controller(tagsRoutes.root)
export class CreateTagController {
  constructor(private readonly createTagUseCase: CreateTagUseCase) {}

  @Post(tagsRoutes.tag.create)
  @ApiOperation({ summary: "Création d'un tag" })
  async createTag(@Body() dto: CreateTagDto) {
    return this.createTagUseCase.execute(dto);
  }
}
