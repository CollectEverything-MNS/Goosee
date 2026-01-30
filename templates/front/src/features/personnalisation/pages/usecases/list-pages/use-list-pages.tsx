import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';

const PAGES_ENDPOINT = '/pages';

const getAll = async () => {
  const data = await api.get(PAGES_ENDPOINT)
  console.log('Pages reçues :', data)
  return data
}

export function usePages() {
  return useQuery({
    queryKey: ["pages"],
    queryFn: async () => await getAll(),
  });
}
