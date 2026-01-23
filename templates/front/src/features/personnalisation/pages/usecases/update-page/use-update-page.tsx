import { Page, PageComponent, PageStatus, PageType } from '@/features/personnalisation/pages/types/page.types';
import { api } from '@/lib/api-client';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export interface UpdatePageDto {
  title?: string;
  slug?: string;
  status?: PageStatus;
  type?: PageType;
  components?: PageComponent[];
  metaTitle?: string;
  metaDescription?: string;
}

const PAGES_ENDPOINT = '/pages';

const update = (id: string, data: UpdatePageDto): Promise<Page> => {
  return api.put<Page>(`${PAGES_ENDPOINT}/${id}`, data);
}

export function useUpdatePage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePageDto }) =>
      update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pages"] });
    },
  });
}
