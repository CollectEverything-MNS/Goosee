import { Injectable, NotFoundException } from '@nestjs/common';
import { IPageRepository } from '../../repositories/page.repository';
import { LogClient } from '../../shared/log-client.service';

@Injectable()
export class DeletePageUseCase {
  constructor(
    private readonly pageRepository: IPageRepository,
    private readonly logClient: LogClient,
  ) {}

  async execute(id: string): Promise<void> {
    const page = await this.pageRepository.findById(id);

    if (!page) {
      this.logClient.warning({
        message: `Tentative de suppression d'une page introuvable : ${id}`,
      });
      throw new NotFoundException('Page not found');
    }

    await this.pageRepository.delete(id);

    this.logClient.success({
      message: `Page supprimée : ${page.slug}`,
    });
  }
}
