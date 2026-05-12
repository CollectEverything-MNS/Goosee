import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { Log } from '../data/log.types';

interface ListLogsResponse {
  message: string;
  logs: Log[];
}

const listLogs = async (): Promise<ListLogsResponse> => {
  return api.get('/logs');
};

export function useListLogs() {
  return useQuery({
    queryKey: ['logs'],
    queryFn: listLogs,
    select: (data) => data.logs,
    refetchInterval: 10000,
  });
}
