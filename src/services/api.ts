const API_URL = typeof window !== 'undefined' ? (process.env.NEXT_PUBLIC_API_URL || '') : '';
const ACCESS_TOKEN = 'lokus_access_token';
const REFRESH_TOKEN = 'lokus_refresh_token';
const ORGANIZATION_ID = 'lokus_organization_id';

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export const tokens = {
  get access() {
    return typeof window !== 'undefined' ? localStorage.getItem(ACCESS_TOKEN) : null;
  },
  get refresh() {
    return typeof window !== 'undefined' ? localStorage.getItem(REFRESH_TOKEN) : null;
  },
  set(access: string, refresh: string) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(ACCESS_TOKEN, access);
      localStorage.setItem(REFRESH_TOKEN, refresh);
    }
  },
  clear() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(ACCESS_TOKEN);
      localStorage.removeItem(REFRESH_TOKEN);
      localStorage.removeItem(ORGANIZATION_ID);
    }
  },
};

export const currentOrganization = {
  get: () => (typeof window !== 'undefined' ? localStorage.getItem(ORGANIZATION_ID) : null),
  set: (id: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(ORGANIZATION_ID, id);
    }
  },
};

async function request<T>(path: string, init: RequestInit = {}, retry = true): Promise<T> {
  const headers = new Headers(init.headers);
  if (!headers.has('Content-Type') && !(init.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  if (tokens.access) {
    headers.set('Authorization', `Bearer ${tokens.access}`);
  }

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, { ...init, headers });
  } catch {
    throw new ApiError(0, 'Cannot reach the Lokus API service.');
  }

  if (response.status === 401 && retry && tokens.refresh && path !== '/api/v1/auth/refresh') {
    try {
      const refreshed = await request<{ access_token: string; refresh_token: string }>(
        '/api/v1/auth/refresh',
        { method: 'POST', body: JSON.stringify({ refresh_token: tokens.refresh }) },
        false
      );
      tokens.set(refreshed.access_token, refreshed.refresh_token);
      return request<T>(path, init, false);
    } catch {
      tokens.clear();
    }
  }

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new ApiError(response.status, body.detail || body.message || `Request failed (${response.status})`);
  }
  return response.status === 204 ? (undefined as T) : (response.json() as Promise<T>);
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'POST', body: body instanceof FormData ? body : JSON.stringify(body) }),
  patch: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};
