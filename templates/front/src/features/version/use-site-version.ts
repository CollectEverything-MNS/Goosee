'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';

export interface SiteVersion {
  current: string;
  latest: string;
  updateType: 'none' | 'patch' | 'minor' | 'major';
  updateAvailable: boolean;
}

// Version du site (fournie par la gateway) : version déployée vs dernière disponible.
export function useSiteVersion() {
  return useQuery({
    queryKey: ['site-version'],
    queryFn: () => api.get<SiteVersion>('/version'),
    staleTime: 60_000,
  });
}
