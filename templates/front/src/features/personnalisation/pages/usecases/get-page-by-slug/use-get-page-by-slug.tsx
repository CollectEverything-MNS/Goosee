import { Page } from '@/features/personnalisation/pages/types/page.types';
import { api } from '@/lib/api-client';
import { useQuery } from '@tanstack/react-query';

const PAGES_ENDPOINT = '/pages/slug';

const getBySlug = async (slug: string): Promise<Page> => {
  return api.get<Page>(`${PAGES_ENDPOINT}/${slug}`);
};

export function useGetPageBySlug(slug: string) {
  return useQuery({
    queryKey: ['page', 'slug', slug],
    queryFn: () => getBySlug(slug),
    enabled: !!slug,
  });
}
