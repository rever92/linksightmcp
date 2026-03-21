import { getValidAccessToken } from './auth.js';
import { resolveBaseUrl } from './config.js';

export function createClient() {
  const baseUrl = resolveBaseUrl();

  async function request(method, path, { body, query } = {}) {
    const token = await getValidAccessToken();
    const url = new URL(path, baseUrl.endsWith('/') ? baseUrl : baseUrl + '/');
    if (query) {
      for (const [k, v] of Object.entries(query)) {
        if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
      }
    }

    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (body) headers['Content-Type'] = 'application/json';

    const res = await fetch(url.toString(), {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    const text = await res.text();
    let data;
    try { data = JSON.parse(text); } catch { data = text; }

    if (!res.ok) {
      const msg = typeof data === 'object' ? (data.message || data.error || JSON.stringify(data)) : data;
      const err = new Error(msg);
      err.status = res.status;
      err.data = data;
      throw err;
    }
    return data;
  }

  return {
    get: (path, opts) => request('GET', path, opts),
    post: (path, body, opts) => request('POST', path, { body, ...opts }),
    put: (path, body, opts) => request('PUT', path, { body, ...opts }),
    delete: (path, opts) => request('DELETE', path, opts),
  };
}
