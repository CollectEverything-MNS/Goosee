import { Injectable } from '@nestjs/common';
import { ISiteSettingsRepository } from '../../repositories/site-settings.repository';
import { UpdateSettingsDto } from './update-settings.dto';
import { SiteSettings } from '../../entities/site-settings.entity';

@Injectable()
export class UpdateSettingsUseCase {
  constructor(private readonly settingsRepository: ISiteSettingsRepository) {}

  async execute(dto: UpdateSettingsDto): Promise<SiteSettings> {
    return this.settingsRepository.upsert(dto);
  }
}
