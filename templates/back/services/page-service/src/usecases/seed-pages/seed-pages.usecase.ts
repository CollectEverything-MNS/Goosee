import { Injectable, Logger } from '@nestjs/common';
import { IPageRepository } from '../../repositories/page.repository';
import { DEFAULT_PAGES } from '../../seeds/default-pages.seed';

@Injectable()
export class SeedPagesUseCase {
  private readonly logger = new Logger(SeedPagesUseCase.name);

  constructor(private readonly pageRepository: IPageRepository) {}

  async execute(): Promise<void> {
    const existingPages = await this.pageRepository.findAll();

    if (existingPages.length > 0) {
      this.logger.log('Pages already exist, skipping seed');
      return;
    }

    this.logger.log('Seeding default pages...');

    for (const pageData of DEFAULT_PAGES) {
      await this.pageRepository.create(pageData);
      this.logger.log(`Created page: ${pageData.title}`);
    }

    this.logger.log('Default pages seeded successfully');
  }
}
