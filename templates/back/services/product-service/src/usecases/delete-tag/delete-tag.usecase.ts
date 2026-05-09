import { Injectable, NotFoundException } from '@nestjs/common';
import { ITagRepository } from '../../repositories/tag.repository';
import { LogClient } from '../../services/log-client.service';

@Injectable()
export class DeleteTagUseCase {
  constructor(
    private readonly tagRepo: ITagRepository,
    private readonly logClient: LogClient
  ) {}

  async execute(id: string) {
    const tag = await this.tagRepo.findById(id);

    if (!tag) {
      this.logClient.warning({
        message: `Tentative de suppression d'un tag introuvable : ${id}`,
      });
      throw new NotFoundException('Tag not found');
    }

    await this.tagRepo.deleteById(id);

    this.logClient.success({
      message: `Tag supprimé : ${tag.name}`,
    });

    return {
      message: 'Tag deleted successfully',
    };
  }
}
