import { ConflictException, Injectable } from '@nestjs/common';
import { IPageRepository } from '../../repositories/page.repository';
import { CreatePageDto } from './create-page.dto';
import { Page, PageType } from '../../entities/page.entity';
import { LogClient } from '../../shared/log-client.service';

const UNIQUE_PAGE_TYPES = [PageType.HOME, PageType.CATALOG, PageType.CONTACT];

@Injectable()
export class CreatePageUseCase {
  constructor(
    private readonly pageRepository: IPageRepository,
    private readonly logClient: LogClient,
  ) {}

  async execute(dto: CreatePageDto): Promise<Page> {
    // Check for duplicate slug
    const existingPage = await this.pageRepository.findBySlug(dto.slug);
    if (existingPage) {
      this.logClient.warning({
        message: `Tentative de création d'une page avec un slug déjà existant : ${dto.slug}`,
      });
      throw new ConflictException('SLUG_ALREADY_EXISTS');
    }

    // Check for unique page types (home, catalog, contact can only exist once)
    if (dto.type && UNIQUE_PAGE_TYPES.includes(dto.type)) {
      const existingTypePages = await this.pageRepository.findByType(dto.type);
      if (existingTypePages) {
        this.logClient.warning({
          message: `Tentative de création d'une page de type unique déjà existant : ${dto.type}`,
        });
        throw new ConflictException('PAGE_TYPE_ALREADY_EXISTS');
      }
    }

    const page = await this.pageRepository.create(dto);

    this.logClient.success({
      message: `Page créée : ${page.slug}`,
    });

    return page;
  }
}
