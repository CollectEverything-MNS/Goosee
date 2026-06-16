import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api-client';

interface ChangePasswordDto {
  oldPassword: string;
  newPassword: string;
}

const changePassword = async (data: ChangePasswordDto) => {
  return api.put('/auth/change-password', data);
};

export function useChangePassword() {
  return useMutation({
    mutationFn: changePassword,
  });
}
