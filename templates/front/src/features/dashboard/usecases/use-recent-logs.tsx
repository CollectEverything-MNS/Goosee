import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';

interface Log {
  id: string;
  service?: string;
  level?: string;
  message: string;
  createdAt: string;
}

interface LogsResponse {
  logs: Log[];
}

export function useRecentLogs(limit = 5) {
  return useQuery({
    queryKey: ['recent-logs', limit],
    queryFn: async () => {
      const data = await api.get<LogsResponse>('/logs');
      return data.logs?.slice(0, limit) ?? [];
    },
    refetchInterval: 15000,
  });
}
