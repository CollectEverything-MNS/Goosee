import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { UpdateProfileDto } from '../account.types';

const updateMe = async (data: UpdateProfileDto) => {
  return api.patch('/users/me', data);
};

export function useUpdateMe() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateMe,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['me'] });
    },
  });
}
