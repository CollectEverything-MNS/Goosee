import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';

import type { StockItem } from './use-list-stocks';

interface GetStockResponse {
  message: string;
  stock: StockItem;
}

const getStock = async (productId: string): Promise<StockItem> => {
  const data = await api.get<GetStockResponse>(`/stock/${productId}`);
  return (data as any)?.stock ?? (data as unknown as StockItem);
};

export function useGetStock(productId: string) {
  return useQuery({
    queryKey: ['stock', productId],
    queryFn: () => getStock(productId),
    enabled: Boolean(productId),
    retry: false,
  });
}
