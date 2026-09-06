import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';

export interface StockMovement {
  id: string;
  productId: string;
  delta: number;
  orderId?: string;
  createdAt: string;
}

interface ListStockMovementsResponse {
  message: string;
  movements: StockMovement[];
}

const listStockMovements = async (productId: string): Promise<ListStockMovementsResponse> => {
  return api.get(`/stock/${productId}/movements`);
};

export function useListStockMovements(productId: string) {
  return useQuery({
    queryKey: ['stock-movements', productId],
    queryFn: () => listStockMovements(productId),
    select: (data) => (Array.isArray(data) ? data : (data?.movements ?? [])),
    enabled: Boolean(productId),
  });
}
