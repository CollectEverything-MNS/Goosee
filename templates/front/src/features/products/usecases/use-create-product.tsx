import { useMutation, useQueryClient } from '@tanstack/react-query';

import { api } from '@/lib/api-client';

export interface CreateProductPayload {
  name: string;
  description?: string;
  price: number;
  preparationTime?: number;
  sizeValue?: number;
  sizeUnit?: string;
  isAvailable?: boolean;
  categoryId?: string;
  categoryIds: string[];
  initialStock?: number;
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateProductPayload) => api.post('/products', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}
