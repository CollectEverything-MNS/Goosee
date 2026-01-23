import { api } from '@/lib/api-client';
import { Page } from '../../types/page.types';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const PAGES_ENDPOINT = '/pages';

const publish = (id: string): Promise<Page> => {
  return api.put<Page>(`${PAGES_ENDPOINT}/${id}`, { status: 'published' });
}

export function usePublishPage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => publish(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pages"] });
    },
  });
}
