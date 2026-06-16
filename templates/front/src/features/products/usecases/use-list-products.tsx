import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';

interface ListProductsResponse {
  message: string;
  products: any[];
}

const listProducts = async (): Promise<ListProductsResponse> => {
  return api.get('/products');
};

export function useListProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: listProducts,
    select: (data) => (Array.isArray(data) ? data : (data?.products ?? [])),
  });
}
