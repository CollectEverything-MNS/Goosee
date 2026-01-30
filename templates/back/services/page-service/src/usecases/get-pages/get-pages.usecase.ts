import { Injectable } from '@nestjs/common';
import { IPageRepository } from '../../repositories/page.repository';
import { Page } from '../../entities/page.entity';

@Injectable()
export class GetPagesUseCase {
  constructor(private readonly pageRepository: IPageRepository) {}

  async execute(): Promise<Page[]> {
    return this.pageRepository.findAll();
  }
}
