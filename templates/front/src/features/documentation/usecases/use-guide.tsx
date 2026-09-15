import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';

interface GuideResponse {
  content: string;
}

const getGuide = async (): Promise<GuideResponse> => {
  return api.get('/assistant/guide');
};

export function useGuide() {
  return useQuery({
    queryKey: ['assistant', 'guide'],
    queryFn: getGuide,
    select: (data) => data.content,
    staleTime: 5 * 60 * 1000,
  });
}
