import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const fetchExemple = async () => {
    const response = await axios.get('/api/exemple');
    return response.data;
};

export const useListFaqs = () => {
    return useQuery({
      queryKey: ['exemple'],
      queryFn: async () => {
        const res = await fetchExemple();
        return res;
    }
    });
  };
  