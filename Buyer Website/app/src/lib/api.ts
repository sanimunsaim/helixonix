/**
 * HelixOnix API Client — Buyer Website
 * Replaces all mockApi calls with real Core API calls
 */

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/v1';

// ── Token management ─────────────────────────────────────────────────────────

export function getAccessToken(): string | null {
  return localStorage.getItem('helix_access_token');
}

export function setTokens(accessToken: string, refreshToken: string) {
  localStorage.setItem('helix_access_token', accessToken);
  localStorage.setItem('helix_refresh_token', refreshToken);
}

export function clearTokens() {
  localStorage.removeItem('helix_access_token');
  localStorage.removeItem('helix_refresh_token');
}

// ── HTTP client ──────────────────────────────────────────────────────────────

async function request<T>(
  path: string,
  options: RequestInit & { auth?: boolean; params?: Record<string, string | number | boolean> } = {}
): Promise<T> {
  const { auth = false, params, ...init } = options;

  let url = `${BASE_URL}${path}`;
  if (params) {
    const qs = new URLSearchParams(
      Object.entries(params)
        .filter(([, v]) => v !== undefined && v !== null && v !== '')
        .map(([k, v]) => [k, String(v)])
    ).toString();
    if (qs) url += `?${qs}`;
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init.headers as Record<string, string> ?? {}),
  };

  if (auth) {
    const token = getAccessToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, { ...init, headers });

  if (response.status === 401 && auth) {
    // Try refresh
    const refreshed = await tryRefresh();
    if (refreshed) {
      headers['Authorization'] = `Bearer ${getAccessToken()}`;
      const retry = await fetch(url, { ...init, headers });
      if (!retry.ok) throw new ApiError(await retry.json(), retry.status);
      return retry.json() as Promise<T>;
    }
    clearTokens();
    window.location.href = '/login';
    throw new ApiError({ error: { code: 'UNAUTHORIZED', message: 'Session expired' } }, 401);
  }

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: { code: 'UNKNOWN', message: response.statusText } }));
    throw new ApiError(err, response.status);
  }

  // Handle empty responses (204)
  const text = await response.text();
  return text ? JSON.parse(text) : ({} as T);
}

async function tryRefresh(): Promise<boolean> {
  const refreshToken = localStorage.getItem('helix_refresh_token');
  if (!refreshToken) return false;
  try {
    const res = await fetch(`${BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) return false;
    const data = await res.json();
    setTokens(data.data.accessToken, data.data.refreshToken);
    return true;
  } catch {
    return false;
  }
}

export class ApiError extends Error {
  code: string;
  statusCode: number;
  details?: unknown;
  constructor(body: any, statusCode: number) {
    super(body?.error?.message ?? 'API Error');
    this.code = body?.error?.code ?? 'UNKNOWN';
    this.statusCode = statusCode;
    this.details = body?.error?.details;
  }
}

// ── Auth ─────────────────────────────────────────────────────────────────────

export const authApi = {
  register: (data: { email: string; username: string; displayName: string; password: string; role?: string }) =>
    request<any>('/auth/register', { method: 'POST', body: JSON.stringify(data) }),

  login: async (email: string, password: string) => {
    const res = await request<any>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
    setTokens(res.data.accessToken, res.data.refreshToken);
    return res.data;
  },

  logout: async () => {
    await request('/auth/logout', { method: 'POST', auth: true }).catch(() => {});
    clearTokens();
  },

  me: () => request<any>('/auth/me', { auth: true }),
};

// ── Assets ────────────────────────────────────────────────────────────────────

export const assetApi = {
  search: (filters: Record<string, string | number | boolean>) =>
    request<any>('/search', { params: { entity: 'assets', ...filters } }),

  getById: (id: string) => request<any>(`/assets/${id}`),

  download: (id: string, license = 'standard') =>
    request<any>(`/assets/${id}/download`, { auth: true, params: { license } }),

  requestUploadUrl: (data: { filename: string; content_type: string; file_size: number }) =>
    request<any>('/assets/upload-url', { method: 'POST', auth: true, body: JSON.stringify(data) }),

  completeUpload: (data: Record<string, unknown>) =>
    request<any>('/assets/upload-complete', { method: 'POST', auth: true, body: JSON.stringify(data) }),

  myAssets: (page = 1) =>
    request<any>('/assets/my', { auth: true, params: { page } }),
};

// ── Gigs ─────────────────────────────────────────────────────────────────────

export const gigApi = {
  getAll: (filters?: Record<string, string | number>) =>
    request<any>('/gigs', { params: filters }),

  getById: (id: string) => request<any>(`/gigs/${id}`),
};

// ── AI Generation ─────────────────────────────────────────────────────────────

export const aiApi = {
  generate: (data: { tool_type: string; prompt?: string; parameters: Record<string, unknown> }) =>
    request<any>('/ai/generate', { method: 'POST', auth: true, body: JSON.stringify(data) }),

  history: (page = 1) =>
    request<any>('/ai/history', { auth: true, params: { page } }),

  streamProgress: (jobId: string): EventSource => {
    const token = getAccessToken();
    return new EventSource(`${BASE_URL}/ai/generate/${jobId}/stream?token=${token}`);
  },
};

// ── Payments ──────────────────────────────────────────────────────────────────

export const paymentApi = {
  checkoutAsset: (assetId: string, licenseType = 'standard') =>
    request<any>('/payments/checkout/asset', { method: 'POST', auth: true, body: JSON.stringify({ asset_id: assetId, license_type: licenseType }) }),

  createSubscription: (plan: string) =>
    request<any>('/payments/subscription/create', { method: 'POST', auth: true, body: JSON.stringify({ plan }) }),

  purchaseCredits: (packId: string) =>
    request<any>('/payments/credits/purchase', { method: 'POST', auth: true, body: JSON.stringify({ pack_id: packId }) }),
};

// ── Orders ────────────────────────────────────────────────────────────────────

export const orderApi = {
  checkoutGig: (data: { gig_id: string; package_type: string; addon_ids?: string[]; requirements?: string }) =>
    request<any>('/payments/checkout/gig', { method: 'POST', auth: true, body: JSON.stringify(data) }),

  myOrders: (page = 1) =>
    request<any>('/orders', { auth: true, params: { page, role: 'buyer' } }),

  getOrder: (id: string) =>
    request<any>(`/orders/${id}`, { auth: true }),

  complete: (id: string) =>
    request<any>(`/orders/${id}/complete`, { method: 'POST', auth: true }),

  requestRevision: (id: string, notes: string, fileKeys?: string[]) =>
    request<any>(`/orders/${id}/revision`, { method: 'POST', auth: true, body: JSON.stringify({ notes, file_keys: fileKeys }) }),

  openDispute: (id: string, reason: string, description: string, evidence?: string[]) =>
    request<any>(`/orders/${id}/dispute`, { method: 'POST', auth: true, body: JSON.stringify({ reason, description, evidence }) }),

  submitReview: (id: string, rating: number, comment?: string) =>
    request<any>(`/orders/${id}/review`, { method: 'POST', auth: true, body: JSON.stringify({ rating, comment }) }),
};

// ── Notifications ─────────────────────────────────────────────────────────────

export const notificationApi = {
  list: (page = 1) =>
    request<any>('/notifications', { auth: true, params: { page } }),

  markRead: (id: string) =>
    request<any>(`/notifications/${id}/read`, { method: 'PATCH', auth: true }),

  markAllRead: () =>
    request<any>('/notifications/read-all', { method: 'PATCH', auth: true }),
};

// ── Messages ──────────────────────────────────────────────────────────────────

export const messageApi = {
  getThread: (orderId: string) =>
    request<any>(`/messages/thread/${orderId}`, { auth: true }),

  send: (orderId: string, content: string, attachmentKeys?: string[]) =>
    request<any>(`/messages/thread/${orderId}/send`, { method: 'POST', auth: true, body: JSON.stringify({ content, attachment_keys: attachmentKeys ?? [] }) }),

  markRead: (orderId: string) =>
    request<any>(`/messages/thread/${orderId}/read`, { method: 'PATCH', auth: true }),
};

// ── Search ────────────────────────────────────────────────────────────────────

export const searchApi = {
  search: (query: string, filters?: Record<string, string>) =>
    request<any>('/search', { params: { query, ...filters } }),
};
