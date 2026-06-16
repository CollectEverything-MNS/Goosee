import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { Profile } from '../account.types';

const getMe = async (): Promise<Profile> => {
  return api.get('/users/me');
};

export function useGetMe(enabled = true) {
  return useQuery({
    queryKey: ['me'],
    queryFn: getMe,
    enabled,
    retry: false,
  });
}
