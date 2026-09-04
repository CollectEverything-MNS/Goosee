import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';

export interface StockItem {
  productId: string;
  quantity: number;
  available: number;
}

interface ListStocksResponse {
  message: string;
  stocks: StockItem[];
}

const listStocks = async (): Promise<ListStocksResponse> => {
  return api.get('/stock');
};

export function useListStocks() {
  return useQuery({
    queryKey: ['stocks'],
    queryFn: listStocks,
    select: (data) => (Array.isArray(data) ? data : (data?.stocks ?? [])),
  });
}
