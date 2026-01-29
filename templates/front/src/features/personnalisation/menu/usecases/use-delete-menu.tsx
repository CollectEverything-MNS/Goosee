import { api } from '@/lib/api-client';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const MENUS_ENDPOINT = '/menus';

const deleteMenu = (id: string): Promise<void> => {
  return api.delete<void>(`${MENUS_ENDPOINT}/${id}`);
};

export function useDeleteMenu() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteMenu(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menus'] });
    },
  });
}
