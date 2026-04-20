import { mockAssets, getTrendingAssets, getAssetBySlug, getRelatedAssets } from './data/assets';
import { mockGigs } from './data/gigs';
import { mockSellers } from './data/sellers';
import { mockGenerations, mockTools } from './data/generations';
import { mockBlogPosts } from './data/blog';

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const mockApi = {
  assets: {
    getAll: async (filters?: Record<string, unknown>) => {
      await delay(400);
      let result = [...mockAssets];
      if (filters?.type) result = result.filter((a) => a.type === filters.type);
      if (filters?.category) result = result.filter((a) => a.category === filters.category);
      if (filters?.license) result = result.filter((a) => a.license === filters.license);
      if (filters?.isFree === true) result = result.filter((a) => a.isFree);
      if (filters?.sort === 'trending') result.sort((a, b) => b.downloadCount - a.downloadCount);
      if (filters?.sort === 'newest') result.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
      if (filters?.sort === 'price-low') result.sort((a, b) => a.price - b.price);
      if (filters?.sort === 'price-high') result.sort((a, b) => b.price - a.price);
      if (filters?.q) {
        const q = String(filters.q).toLowerCase();
        result = result.filter((a) => a.title.toLowerCase().includes(q) || a.tags.some((t) => t.includes(q)));
      }
      const page = Number(filters?.page || 1);
      const limit = Number(filters?.limit || 12);
      return {
        items: result.slice((page - 1) * limit, page * limit),
        total: result.length,
        page,
        totalPages: Math.ceil(result.length / limit),
      };
    },
    getTrending: async () => {
      await delay(300);
      return getTrendingAssets();
    },
    getBySlug: async (slug: string) => {
      await delay(300);
      return getAssetBySlug(slug) || null;
    },
    getRelated: async (id: string) => {
      await delay(300);
      return getRelatedAssets(id);
    },
  },
  gigs: {
    getAll: async (filters?: Record<string, unknown>) => {
      await delay(400);
      let result = [...mockGigs];
      if (filters?.category) result = result.filter((g) => g.category === filters.category);
      if (filters?.q) {
        const q = String(filters.q).toLowerCase();
        result = result.filter((g) => g.title.toLowerCase().includes(q) || g.description.toLowerCase().includes(q));
      }
      return { items: result, total: result.length };
    },
    getBySlug: async (_seller: string, slug: string) => {
      await delay(300);
      return mockGigs.find((g) => g.slug === slug) || null;
    },
  },
  sellers: {
    getAll: async () => {
      await delay(300);
      return mockSellers;
    },
    getByUsername: async (username: string) => {
      await delay(300);
      return mockSellers.find((s) => s.username === username) || null;
    },
  },
  generations: {
    getAll: async () => {
      await delay(300);
      return [...mockGenerations];
    },
    create: async (data: { toolType: string; prompt: string; parameters: Record<string, unknown> }) => {
      await delay(500);
      const tool = mockTools.find((t) => t.id === data.toolType);
      const gen = {
        id: `gen${Date.now()}`,
        toolType: data.toolType,
        prompt: data.prompt,
        thumbnail: '/images/asset-image-1.jpg',
        outputUrl: '/images/asset-image-1.jpg',
        date: new Date().toISOString().split('T')[0],
        creditsUsed: tool?.creditCost || 10,
        status: 'completed' as const,
        parameters: data.parameters,
        saved: false,
      };
      mockGenerations.unshift(gen);
      return gen;
    },
  },
  tools: {
    getAll: async () => {
      await delay(200);
      return mockTools;
    },
    getById: async (id: string) => {
      await delay(200);
      return mockTools.find((t) => t.id === id) || null;
    },
  },
  blog: {
    getAll: async () => {
      await delay(300);
      return mockBlogPosts;
    },
    getBySlug: async (slug: string) => {
      await delay(300);
      return mockBlogPosts.find((p) => p.slug === slug) || null;
    },
    getFeatured: async () => {
      await delay(200);
      return mockBlogPosts.find((p) => p.featured) || mockBlogPosts[0];
    },
  },
  credits: {
    getBalance: async () => {
      await delay(200);
      return { balance: 245 };
    },
  },
};
