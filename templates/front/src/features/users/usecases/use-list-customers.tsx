import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';

const CUSTOMERS_ENDPOINT = '/users/customers';

const getAll = async (): Promise<any[]> => {
  return api.get(CUSTOMERS_ENDPOINT);
};

export function useListCustomers() {
  return useQuery({
    queryKey: ['customers'],
    queryFn: getAll,
  });
}
