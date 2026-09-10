import { Injectable, Logger } from '@nestjs/common';
import { IPageRepository } from '../../repositories/page.repository';
import { IMenuRepository } from '../../repositories/menu.repository';
import { DEFAULT_PAGES } from '../../seeds/default-pages.seed';

const FOOTER_LINKED_SLUGS = ['mentions-legales', 'politique-de-confidentialite'];

@Injectable()
export class SeedPagesUseCase {
  private readonly logger = new Logger(SeedPagesUseCase.name);

  constructor(
    private readonly pageRepository: IPageRepository,
    private readonly menuRepository: IMenuRepository
  ) {}

  async execute(): Promise<void> {
    const existingPages = await this.pageRepository.findAll();

    if (existingPages.length > 0) {
      this.logger.log('Pages already exist, skipping seed');
      return;
    }

    this.logger.log('Seeding default pages...');

    let footerMenuOrder = 0;
    for (const pageData of DEFAULT_PAGES) {
      const page = await this.pageRepository.create(pageData);
      this.logger.log(`Created page: ${pageData.title}`);

      if (page.slug && FOOTER_LINKED_SLUGS.includes(page.slug)) {
        await this.menuRepository.create({
          label: page.title,
          pageId: page.id,
          order: footerMenuOrder++,
          isActive: true,
        });
        this.logger.log(`Created footer menu entry for page: ${page.title}`);
      }
    }

    this.logger.log('Default pages seeded successfully');
  }
}
