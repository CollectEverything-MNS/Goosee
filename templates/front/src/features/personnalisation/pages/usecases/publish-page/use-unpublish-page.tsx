import { api } from '@/lib/api-client';
import { Page } from '../../types/page.types';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const PAGES_ENDPOINT = '/pages';

const unpublish = (id: string): Promise<Page> => {
  return api.put<Page>(`${PAGES_ENDPOINT}/${id}`, { status: 'draft' });
}

export function useUnpublishPage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => unpublish(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pages"] });
    },
  });
}
