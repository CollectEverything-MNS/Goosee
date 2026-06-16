import { useMutation, useQueryClient } from '@tanstack/react-query';

import { api } from '@/lib/api-client';

import type { CreateCategoryPayload } from './use-create-category';

export type UpdateCategoryPayload = Partial<CreateCategoryPayload>;

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCategoryPayload }) =>
      api.patch(`/categories/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}
