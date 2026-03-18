import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';

const deleteUser = async (id: string) => {
  return api.delete(`/users/delete-user/${id}`);
};

export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admins'] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });
}
