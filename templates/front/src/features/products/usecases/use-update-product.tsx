import { useMutation, useQueryClient } from '@tanstack/react-query';

import { api } from '@/lib/api-client';

import type { CreateProductPayload } from './use-create-product';

export type UpdateProductPayload = Partial<CreateProductPayload>;

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProductPayload }) =>
      api.patch(`/products/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}
