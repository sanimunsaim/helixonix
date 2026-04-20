import { useQuery } from '@tanstack/react-query';
import { mockApi } from '@/lib/mockApi';

export function useSellers() {
  return useQuery({
    queryKey: ['sellers'],
    queryFn: () => mockApi.sellers.getAll(),
  });
}

export function useSeller(username: string) {
  return useQuery({
    queryKey: ['seller', username],
    queryFn: () => mockApi.sellers.getByUsername(username),
    enabled: !!username,
  });
}
