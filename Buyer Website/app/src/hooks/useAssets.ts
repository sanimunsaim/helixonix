import { useQuery } from '@tanstack/react-query';
import { assetApi, searchApi } from '@/lib/api';

export function useAssets(filters?: Record<string, string | number | boolean>) {
  return useQuery({
    queryKey: ['assets', filters],
    queryFn: async () => {
      const res = await assetApi.search(filters || {});
      // Support array or { data: array } based on API structure
      return res.data?.hits ? res.data.hits.map((h: any) => h.document) : (res.data || []);
    },
  });
}

export function useAsset(idOrSlug: string) {
  return useQuery({
    queryKey: ['asset', idOrSlug],
    queryFn: async () => {
      // Try fetch by ID first, or fallback to search by slug
      try {
        const res = await assetApi.getById(idOrSlug);
        return res.data;
      } catch (e) {
        const res = await searchApi.search(idOrSlug, { entity: 'assets' });
        return res.data?.hits?.[0]?.document || null;
      }
    },
    enabled: !!idOrSlug,
  });
}

export function useTrendingAssets() {
  return useQuery({
    queryKey: ['assets', 'trending'],
    queryFn: async () => {
      const res = await assetApi.search({ sort: 'popular' });
      return res.data?.hits ? res.data.hits.map((h: any) => h.document) : (res.data || []);
    },
  });
}

export function useRelatedAssets(id: string) {
  return useQuery({
    queryKey: ['assets', 'related', id],
    queryFn: async () => {
      const res = await assetApi.search({});
      return res.data?.hits ? res.data.hits.map((h: any) => h.document).slice(0, 4) : [];
    },
    enabled: !!id,
  });
}
