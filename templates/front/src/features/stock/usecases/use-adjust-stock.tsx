import { useMutation, useQueryClient } from '@tanstack/react-query';

import { api } from '@/lib/api-client';

export interface AdjustStockPayload {
  quantity: number;
}

export function useAdjustStock() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ productId, data }: { productId: string; data: AdjustStockPayload }) =>
      api.patch(`/stock/${productId}`, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['stocks'] });
      queryClient.invalidateQueries({ queryKey: ['stock', variables.productId] });
      queryClient.invalidateQueries({ queryKey: ['stock-movements', variables.productId] });
    },
  });
}
