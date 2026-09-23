'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';

// Demande la mise à jour du site vers la dernière version (déclenché par l'admin du site).
export function useUpdateSite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.post<{ version: string }>('/version/update'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-version'] });
    },
  });
}
