import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { Menu } from '../types/menu.types';

const MENUS_ENDPOINT = '/menus';

const getAll = async (): Promise<Menu[]> => {
  return api.get(MENUS_ENDPOINT);
};

export function useMenus() {
  return useQuery({
    queryKey: ['menus'],
    queryFn: getAll,
  });
}
