import { api } from '@/lib/api-client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { UpdateSettingsDto, SiteSettings } from '../types/settings.types';

const SETTINGS_ENDPOINT = '/settings';

const updateSettings = (data: UpdateSettingsDto): Promise<SiteSettings> => {
  return api.put<SiteSettings>(SETTINGS_ENDPOINT, data);
};

export function useUpdateSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateSettingsDto) => updateSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
  });
}
