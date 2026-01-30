import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { SiteSettings } from '../types/settings.types';

const SETTINGS_ENDPOINT = '/settings';

const getSettings = async (): Promise<SiteSettings> => {
  return api.get(SETTINGS_ENDPOINT);
};

export function useSettings() {
  return useQuery({
    queryKey: ['settings'],
    queryFn: getSettings,
  });
}
