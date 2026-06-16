'use client';

import { useSettings } from '@/features/personnalisation/settings/usecases/use-get-settings';

export type SiteTemplateCategory = 'drive' | 'bakery' | 'restaurant' | 'beauty' | 'default';

const VALID: SiteTemplateCategory[] = ['drive', 'bakery', 'restaurant', 'beauty'];

export function useSiteTemplate(): SiteTemplateCategory {
  const { data: settings } = useSettings();
  const raw = settings?.metadata?.templateCategory;
  if (typeof raw === 'string' && (VALID as string[]).includes(raw)) {
    return raw as SiteTemplateCategory;
  }
  return 'default';
}
