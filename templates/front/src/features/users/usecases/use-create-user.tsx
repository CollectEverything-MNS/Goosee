import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';

interface CreateUserDto {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  address?: string;
  postaleCode?: string;
  city?: string;
  country?: string;
  role: string[];
}

const createUser = async (data: CreateUserDto): Promise<any> => {
  return api.post('/users/create-user', data);
};

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admins'] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });
}
