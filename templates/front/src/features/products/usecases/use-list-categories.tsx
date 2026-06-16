import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';

interface ListCategoriesResponse {
  message: string;
  categories: any[];
}

const listCategories = async (): Promise<ListCategoriesResponse> => {
  return api.get('/categories');
};

export function useListCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: listCategories,
    select: (data) => (Array.isArray(data) ? data : (data?.categories ?? [])),
  });
}
