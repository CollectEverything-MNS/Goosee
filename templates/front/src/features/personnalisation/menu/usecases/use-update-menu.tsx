import { api } from '@/lib/api-client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { UpdateMenuDto, Menu } from '../types/menu.types';

const MENUS_ENDPOINT = '/menus';

const update = (id: string, data: UpdateMenuDto): Promise<Menu> => {
  return api.put<Menu>(`${MENUS_ENDPOINT}/${id}`, data);
};

export function useUpdateMenu() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateMenuDto }) =>
      update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menus'] });
    },
  });
}
