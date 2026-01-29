import { api } from '@/lib/api-client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ReorderMenusDto } from '../types/menu.types';

const MENUS_ENDPOINT = '/menus';

const reorder = (data: ReorderMenusDto): Promise<void> => {
  return api.put<void>(`${MENUS_ENDPOINT}/reorder`, data);
};

export function useReorderMenus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ReorderMenusDto) => reorder(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menus'] });
    },
  });
}
