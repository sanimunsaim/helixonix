import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ApiEndpoint {
  id: string;
  category: string;
  name: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  description: string;
}

export interface ApiConfigState {
  coreApiUrl: string;
  brainApiUrl: string;
  webSocketUrl: string;
  endpoints: ApiEndpoint[];
  updateBaseUrl: (service: 'core' | 'brain' | 'ws', url: string) => void;
  updateEndpoint: (id: string, path: string) => void;
  resetToDefaults: () => void;
}

const defaultEndpoints: ApiEndpoint[] = [
  // Auth
  { id: 'auth_login', category: 'Auth', name: 'Login', method: 'POST', path: '/auth/login', description: 'Authenticate users and admins' },
  { id: 'auth_logout', category: 'Auth', name: 'Logout', method: 'POST', path: '/auth/logout', description: 'Invalidate current session' },
  { id: 'auth_me', category: 'Auth', name: 'Get Current User', method: 'GET', path: '/auth/me', description: 'Get logged in user profile' },
  
  // Content Moderation
  { id: 'content_queue', category: 'Content', name: 'Moderation Queue', method: 'GET', path: '/admin/content/queue', description: 'Fetch pending assets' },
  { id: 'content_approve', category: 'Content', name: 'Approve Asset', method: 'PATCH', path: '/admin/content/:id/approve', description: 'Approve an asset' },
  { id: 'content_reject', category: 'Content', name: 'Reject Asset', method: 'PATCH', path: '/admin/content/:id/reject', description: 'Reject an asset' },
  
  // Users
  { id: 'users_list', category: 'Users', name: 'List Users', method: 'GET', path: '/admin/users', description: 'Get all platform users' },
  { id: 'users_ban', category: 'Users', name: 'Ban User', method: 'PATCH', path: '/admin/users/:id/ban', description: 'Suspend user account' },
  
  // Brain / AI
  { id: 'brain_health', category: 'HELIX-BRAIN', name: 'Brain Health', method: 'GET', path: '/health', description: 'Check AI service health' },
  { id: 'brain_command', category: 'HELIX-BRAIN', name: 'Execute Command', method: 'POST', path: '/internal/helix-brain/command', description: 'Run internal brain commands' },
  
  // Search
  { id: 'search_query', category: 'Search', name: 'Global Search', method: 'GET', path: '/search', description: 'Query Typesense search engine' },
];

export const useApiConfigStore = create<ApiConfigState>()(
  persist(
    (set) => ({
      coreApiUrl: 'http://localhost:3000/v1',
      brainApiUrl: 'http://localhost:3001',
      webSocketUrl: 'ws://localhost:3000',
      endpoints: defaultEndpoints,
      
      updateBaseUrl: (service, url) => set((state) => {
        if (service === 'core') return { coreApiUrl: url };
        if (service === 'brain') return { brainApiUrl: url };
        if (service === 'ws') return { webSocketUrl: url };
        return state;
      }),
      
      updateEndpoint: (id, path) => set((state) => ({
        endpoints: state.endpoints.map(ep => ep.id === id ? { ...ep, path } : ep)
      })),
      
      resetToDefaults: () => set({
        coreApiUrl: 'http://localhost:3000/v1',
        brainApiUrl: 'http://localhost:3001',
        webSocketUrl: 'ws://localhost:3000',
        endpoints: defaultEndpoints
      })
    }),
    {
      name: 'helix-api-registry'
    }
  )
);
