/**
 * HelixOnix API Client — Seller Website
 */

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/v1';

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
    const refreshToken = localStorage.getItem('helix_refresh_token');
    if (refreshToken) {
      try {
        const res = await fetch(`${BASE_URL}/auth/refresh`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ refreshToken }) });
        if (res.ok) {
          const data = await res.json();
          setTokens(data.data.accessToken, data.data.refreshToken);
          headers['Authorization'] = `Bearer ${data.data.accessToken}`;
          const retry = await fetch(url, { ...init, headers });
          if (retry.ok) return retry.json() as Promise<T>;
        }
      } catch {}
    }
    clearTokens();
    window.location.href = '/login';
    throw new Error('Session expired');
  }

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: { code: 'UNKNOWN', message: response.statusText } }));
    const e = new Error(err?.error?.message ?? response.statusText) as any;
    e.code = err?.error?.code ?? 'UNKNOWN';
    e.statusCode = response.status;
    throw e;
  }

  const text = await response.text();
  return text ? JSON.parse(text) : ({} as T);
}

// ── Auth ─────────────────────────────────────────────────────────────────────

export const authApi = {
  register: (data: { email: string; username: string; displayName: string; password: string; role: 'seller' }) =>
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

// ── Assets (Seller upload) ────────────────────────────────────────────────────

export const assetApi = {
  myAssets: (page = 1) => request<any>('/assets/my', { auth: true, params: { page } }),

  requestUploadUrl: (data: { filename: string; content_type: string; file_size: number }) =>
    request<any>('/assets/upload-url', { method: 'POST', auth: true, body: JSON.stringify(data) }),

  completeUpload: (data: Record<string, unknown>) =>
    request<any>('/assets/upload-complete', { method: 'POST', auth: true, body: JSON.stringify(data) }),
};

// ── Gigs ─────────────────────────────────────────────────────────────────────

export const gigApi = {
  myGigs: () => request<any>('/gigs/my', { auth: true }),

  getById: (id: string) => request<any>(`/gigs/${id}`),

  create: (data: Record<string, unknown>) =>
    request<any>('/gigs', { method: 'POST', auth: true, body: JSON.stringify(data) }),

  publish: (id: string) =>
    request<any>(`/gigs/${id}/publish`, { method: 'POST', auth: true }),
};

// ── Orders (Seller view) ──────────────────────────────────────────────────────

export const orderApi = {
  myOrders: (page = 1) =>
    request<any>('/orders', { auth: true, params: { page, role: 'seller' } }),

  getOrder: (id: string) =>
    request<any>(`/orders/${id}`, { auth: true }),

  deliver: (id: string, fileKeys: string[], message: string) =>
    request<any>(`/orders/${id}/deliver`, { method: 'POST', auth: true, body: JSON.stringify({ file_keys: fileKeys, message }) }),

  requestUploadUrl: (filename: string, contentType: string, fileSize: number) =>
    request<any>('/assets/upload-url', { method: 'POST', auth: true, body: JSON.stringify({ filename, content_type: contentType, file_size: fileSize }) }),
};

// ── Notifications ─────────────────────────────────────────────────────────────

export const notificationApi = {
  list: (page = 1) => request<any>('/notifications', { auth: true, params: { page } }),
  markRead: (id: string) => request<any>(`/notifications/${id}/read`, { method: 'PATCH', auth: true }),
  markAllRead: () => request<any>('/notifications/read-all', { method: 'PATCH', auth: true }),
};

// ── Messages ──────────────────────────────────────────────────────────────────

export const messageApi = {
  getThread: (orderId: string) => request<any>(`/messages/thread/${orderId}`, { auth: true }),
  send: (orderId: string, content: string) =>
    request<any>(`/messages/thread/${orderId}/send`, { method: 'POST', auth: true, body: JSON.stringify({ content, attachment_keys: [] }) }),
};

// ── Payouts ───────────────────────────────────────────────────────────────────

export const payoutApi = {
  request: (amountCents: number) =>
    request<any>('/payments/payout/request', { method: 'POST', auth: true, body: JSON.stringify({ amount_cents: amountCents }) }),
};
