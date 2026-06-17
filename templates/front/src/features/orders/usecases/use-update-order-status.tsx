import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { OrderStatus } from '../data/order.types';

interface UpdateStatusInput {
  id: string;
  status: OrderStatus;
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: UpdateStatusInput) => {
      return api.patch(`/orders/${id}/status`, { status });
    },
    onSuccess: () => {
      // Rafraîchit la liste admin (et donc l'analytics, qui partage cette requête).
      queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] });
    },
  });
}
