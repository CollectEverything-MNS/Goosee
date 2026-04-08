import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { UpdateRoleDto } from '../data/role.types';

const updateRole = async ({ id, data }: { id: string; data: UpdateRoleDto }) => {
  return api.put(`/roles/${id}`, data);
};

export function useUpdateRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    },
  });
}
