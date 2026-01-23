import { api } from '@/lib/api-client';
import { Page } from '../../types/page.types';
import { useQuery } from '@tanstack/react-query';

const PAGES_ENDPOINT = '/pages';

const getById = (id: string): Promise<Page> => {
  return api.get<Page>(`${PAGES_ENDPOINT}/${id}`);
}

export function usePage(id: string) {
  return useQuery({
    queryKey: ["pages", id],
    queryFn: () => getById(id),
    enabled: !!id,
  });
}