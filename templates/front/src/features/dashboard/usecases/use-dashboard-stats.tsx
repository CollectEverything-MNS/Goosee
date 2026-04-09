import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';

interface StatsResponse {
  admins: number;
  customers: number;
  roles: number;
  logs: number;
}

async function fetchStats(): Promise<StatsResponse> {
  const [admins, customers, roles, logs] = await Promise.all([
    api.get<{ users: any[] }>('/users/admins'),
    api.get<{ users: any[] }>('/users/customers'),
    api.get<{ roles: any[] }>('/roles'),
    api.get<{ logs: any[] }>('/logs'),
  ]);

  return {
    admins: admins.users?.length ?? 0,
    customers: customers.users?.length ?? 0,
    roles: roles.roles?.length ?? 0,
    logs: logs.logs?.length ?? 0,
  };
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: fetchStats,
    refetchInterval: 30000,
  });
}
