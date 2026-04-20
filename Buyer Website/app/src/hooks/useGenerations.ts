import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mockApi } from '@/lib/mockApi';

export function useGenerations() {
  return useQuery({
    queryKey: ['generations'],
    queryFn: () => mockApi.generations.getAll(),
  });
}

export function useCreateGeneration() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { toolType: string; prompt: string; parameters: Record<string, unknown> }) =>
      mockApi.generations.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['generations'] }),
  });
}
