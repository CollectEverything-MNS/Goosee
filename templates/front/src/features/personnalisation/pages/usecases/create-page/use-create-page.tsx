import { Page, PageComponent, PageStatus, PageType } from '@/features/personnalisation/pages/types/page.types';
import { api } from '@/lib/api-client';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const PAGES_ENDPOINT = '/pages';

export interface CreatePageDto {
  title: string;
  slug: string;
  status?: PageStatus;
  type?: PageType;
  components?: PageComponent[];
  metaTitle?: string;
  metaDescription?: string;
}

const create = (data: CreatePageDto): Promise<Page> => {
  return api.post<Page>(PAGES_ENDPOINT, data);
}

export function useCreatePage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePageDto) => create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pages"] });
    },
  });
}