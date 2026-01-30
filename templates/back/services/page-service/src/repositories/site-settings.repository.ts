import { SiteSettings } from '../entities/site-settings.entity';

export abstract class ISiteSettingsRepository {
  abstract get(): Promise<SiteSettings | null>;
  abstract upsert(settings: Partial<SiteSettings>): Promise<SiteSettings>;
}
