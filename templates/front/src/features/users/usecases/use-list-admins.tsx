import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';

const ADMINS_ENDPOINT = '/users/admins';

const getAll = async (): Promise<any[]> => {
  return api.get(ADMINS_ENDPOINT);
};

export function useListAdmins() {
  return useQuery({
    queryKey: ['admins'],
    queryFn: getAll,
  });
}
