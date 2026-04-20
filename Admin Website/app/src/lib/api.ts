/**
 * HelixOnix API Client — Admin Website
 */

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/v1';

export function getAccessToken(): string | null {
  return localStorage.getItem('helix_admin_token');
}

export function setTokens(accessToken: string, refreshToken: string) {
  localStorage.setItem('helix_admin_token', accessToken);
  localStorage.setItem('helix_admin_refresh_token', refreshToken);
}

export function clearTokens() {
  localStorage.removeItem('helix_admin_token');
  localStorage.removeItem('helix_admin_refresh_token');
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
  login: async (email: string, password: string) => {
    const res = await request<any>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
    if (!['admin', 'super_admin'].includes(res.data.user?.role)) throw new Error('Admin access required');
    setTokens(res.data.accessToken, res.data.refreshToken);
    return res.data;
  },

  logout: async () => {
    await request('/auth/logout', { method: 'POST', auth: true }).catch(() => {});
    clearTokens();
  },

  me: () => request<any>('/auth/me', { auth: true }),
};

// ── Admin: Content ────────────────────────────────────────────────────────────

export const contentApi = {
  queue: () => request<any>('/admin/content/queue', { auth: true }),
  approve: (assetId: string) => request<any>(`/admin/content/${assetId}/approve`, { method: 'PATCH', auth: true }),
  reject: (assetId: string, reason: string) =>
    request<any>(`/admin/content/${assetId}/reject`, { method: 'PATCH', auth: true, body: JSON.stringify({ reason }) }),
};

// ── Admin: Users ──────────────────────────────────────────────────────────────

export const userApi = {
  list: (page = 1, search = '') => request<any>('/admin/users', { auth: true, params: { page, search } }),
  ban: (userId: string, reason: string) =>
    request<any>(`/admin/users/${userId}/ban`, { method: 'PATCH', auth: true, body: JSON.stringify({ reason }) }),
  unban: (userId: string) =>
    request<any>(`/admin/users/${userId}/unban`, { method: 'PATCH', auth: true }),
};

// ── Admin: Orders ─────────────────────────────────────────────────────────────

export const orderApi = {
  list: (page = 1) => request<any>('/admin/orders', { auth: true, params: { page } }),
};

// ── Admin: Disputes ───────────────────────────────────────────────────────────

export const disputeApi = {
  list: () => request<any>('/admin/disputes', { auth: true }),
  resolve: (disputeId: string, outcome: string, refundAmountCents?: number) =>
    request<any>(`/admin/disputes/${disputeId}/resolve`, { method: 'PATCH', auth: true, body: JSON.stringify({ outcome, refund_amount_cents: refundAmountCents }) }),
};

// ── Admin: Finance ────────────────────────────────────────────────────────────

export const financeApi = {
  payouts: () => request<any>('/admin/finance/payouts', { auth: true }),
  processPayout: (payoutId: string) =>
    request<any>(`/admin/finance/payouts/${payoutId}/process`, { method: 'POST', auth: true }),
};

// ── Admin: Analytics ─────────────────────────────────────────────────────────

export const analyticsApi = {
  overview: () => request<any>('/admin/analytics/overview', { auth: true }),
};

// ── HELIX-BRAIN ───────────────────────────────────────────────────────────────

export const helixBrainApi = {
  command: (command: string, adminId: string, adminRole: string, confirmation?: string) =>
    fetch('http://localhost:3001/internal/helix-brain/command', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command, admin_id: adminId, admin_role: adminRole, confirmation }),
    }).then(r => r.json()),

  health: () => fetch('http://localhost:3001/health').then(r => r.json()),

  analytics: (metric: string, dateRange: string) =>
    fetch(`http://localhost:3001/internal/helix-brain/analytics?metric=${metric}&date_range=${dateRange}`).then(r => r.json()),
};
