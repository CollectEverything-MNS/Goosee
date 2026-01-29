import { api } from '@/lib/api-client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CreateMenuDto, Menu } from '../types/menu.types';

const MENUS_ENDPOINT = '/menus';

const create = (data: CreateMenuDto): Promise<Menu> => {
  return api.post<Menu>(MENUS_ENDPOINT, data);
};

export function useCreateMenu() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateMenuDto) => create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menus'] });
    },
  });
}
