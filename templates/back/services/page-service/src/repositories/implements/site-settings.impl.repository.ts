import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SiteSettings } from '../../entities/site-settings.entity';
import { ISiteSettingsRepository } from '../site-settings.repository';

@Injectable()
export class TypeOrmSiteSettingsRepository extends ISiteSettingsRepository {
  constructor(
    @InjectRepository(SiteSettings)
    private readonly settingsRepository: Repository<SiteSettings>
  ) {
    super();
  }

  async get(): Promise<SiteSettings | null> {
    const settings = await this.settingsRepository.find({
      take: 1,
    });
    return settings[0] || null;
  }

  async upsert(data: Partial<SiteSettings>): Promise<SiteSettings> {
    const existing = await this.get();

    if (existing) {
      const updated = this.settingsRepository.merge(existing, data);
      return this.settingsRepository.save(updated);
    }

    const newSettings = this.settingsRepository.create(data);
    return this.settingsRepository.save(newSettings);
  }
}
