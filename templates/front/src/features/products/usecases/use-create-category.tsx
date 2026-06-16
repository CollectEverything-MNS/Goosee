import { useMutation, useQueryClient } from '@tanstack/react-query';

import { api } from '@/lib/api-client';

export interface CreateCategoryPayload {
  name: string;
  description?: string;
  imageUrl?: string;
  parentId?: string;
  order?: number;
  isActive?: boolean;
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateCategoryPayload) => api.post('/categories', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}
