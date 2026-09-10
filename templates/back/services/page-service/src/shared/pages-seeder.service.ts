import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { SeedPagesUseCase } from '../usecases/seed-pages/seed-pages.usecase';

@Injectable()
export class PagesSeederService implements OnApplicationBootstrap {
  private readonly logger = new Logger(PagesSeederService.name);

  constructor(private readonly seedPagesUseCase: SeedPagesUseCase) {}

  async onApplicationBootstrap(): Promise<void> {
    try {
      await this.seedPagesUseCase.execute();
    } catch (err) {
      this.logger.error(`Seed des pages impossible : ${(err as Error).message}`);
    }
  }
}
