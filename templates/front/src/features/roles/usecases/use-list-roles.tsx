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

const sortRoles = (roles: Role[]): Role[] => {
  const owner = roles.find((r) => r.name === 'OWNER');
  const customer = roles.find((r) => r.name === 'CUSTOMER');
  const others = roles
    .filter((r) => r.name !== 'OWNER' && r.name !== 'CUSTOMER')
    .sort((a, b) => a.name.localeCompare(b.name));

  return [
    ...(owner ? [owner] : []),
    ...others,
    ...(customer ? [customer] : []),
  ];
};

export function useListRoles() {
  return useQuery({
    queryKey: ['roles'],
    queryFn: listRoles,
    select: (data) => sortRoles(data.roles),
  });
}
