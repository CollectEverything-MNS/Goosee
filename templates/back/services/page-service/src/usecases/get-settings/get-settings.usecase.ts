import { Injectable } from '@nestjs/common';
import { ISiteSettingsRepository } from '../../repositories/site-settings.repository';
import { SiteSettings } from '../../entities/site-settings.entity';

const DEFAULT_SETTINGS: Partial<SiteSettings> = {
  title: 'Mon Site',
  description: '',
  logoUrl: '',
  faviconUrl: '',
  primaryColor: '#3b82f6',
  metadata: {},
};

@Injectable()
export class GetSettingsUseCase {
  constructor(private readonly settingsRepository: ISiteSettingsRepository) {}

  async execute(): Promise<SiteSettings> {
    const settings = await this.settingsRepository.get();

    if (!settings) {
      return this.settingsRepository.upsert(DEFAULT_SETTINGS);
    }

    return settings;
  }
}
