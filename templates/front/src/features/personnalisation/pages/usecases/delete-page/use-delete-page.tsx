import { api } from '@/lib/api-client';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const PAGES_ENDPOINT = '/pages';

const deletePage = (id: string): Promise<void> => {
  return api.delete<void>(`${PAGES_ENDPOINT}/${id}`);
}

export function useDeletePage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deletePage(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pages"] });
    },
  });
}