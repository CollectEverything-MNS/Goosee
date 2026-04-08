import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { Role } from '../data/role.types';

interface ListRolesResponse {
  message: string;
  roles: Role[];
}

const listRoles = async (): Promise<ListRolesResponse> => {
  return api.get('/roles');
};

export function useListRoles() {
  return useQuery({
    queryKey: ['roles'],
    queryFn: listRoles,
    select: (data) => data.roles,
  });
}
