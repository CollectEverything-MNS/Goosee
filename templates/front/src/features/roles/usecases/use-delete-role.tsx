import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';

const deleteRole = async (id: string) => {
  return api.delete(`/roles/${id}`);
};

export function useDeleteRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    },
  });
}
