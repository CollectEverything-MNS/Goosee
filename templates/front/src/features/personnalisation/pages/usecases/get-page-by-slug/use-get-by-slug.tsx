import { Page } from '@/features/personnalisation/pages/types/page.types';
import { api } from '@/lib/api-client';
import { useQuery } from '@tanstack/react-query';

const PAGES_ENDPOINT = '/pages';

const getBySlug = (slug: string): Promise<Page> => {
  return api.get<Page>(`${PAGES_ENDPOINT}/slug/${slug}`);
}

export function usePageBySlug(slug: string) {
  return useQuery({
    queryKey: ["pages", slug],
    queryFn: () => getBySlug(slug),
    enabled: !!slug,
  });
}