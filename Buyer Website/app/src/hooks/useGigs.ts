import { useQuery } from '@tanstack/react-query';
import { searchApi, gigApi } from '@/lib/api';

export function useGigs(filters?: Record<string, string | number>) {
  return useQuery({
    queryKey: ['gigs', filters],
    queryFn: async () => {
      const res = await searchApi.search('', { entity: 'gigs', ...filters });
      return res.data?.hits ? res.data.hits.map((h: any) => h.document) : (res.data || []);
    },
  });
}

export function useGig(seller: string, slug: string) {
  return useQuery({
    queryKey: ['gig', seller, slug],
    queryFn: async () => {
      const res = await searchApi.search(slug, { entity: 'gigs' });
      return res.data?.hits?.[0]?.document || null;
    },
    enabled: !!slug && !!seller,
  });
}
