import { resolveBaseUrl } from './config.js';

// In-memory token store (single-user MCP server)
let tokens = {
  access_token: null,
  refresh_token: null,
  user: null,
};

export function getTokens() {
  return tokens;
}

export function setTokens(data) {
  tokens = { ...tokens, ...data };
}

export function clearTokens() {
  tokens = { access_token: null, refresh_token: null, user: null };
}

function isTokenExpired(token) {
  if (!token) return true;
  try {
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    // Consider expired 30s before actual expiry to avoid race conditions
    return payload.exp && (payload.exp * 1000 - 30000) < Date.now();
  } catch {
    return true;
  }
}

/**
 * Returns a valid access token, refreshing if needed.
 * Auto-logs in from env vars if no tokens exist.
 */
export async function getValidAccessToken() {
  // If access token is still valid, return it
  if (tokens.access_token && !isTokenExpired(tokens.access_token)) {
    return tokens.access_token;
  }

  // Try refresh if we have a refresh token
  if (tokens.refresh_token && !isTokenExpired(tokens.refresh_token)) {
    try {
      const res = await fetch(`${resolveBaseUrl()}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: tokens.refresh_token }),
      });
      if (res.ok) {
        const data = await res.json();
        setTokens(data);
        return data.access_token;
      }
    } catch {
      // Refresh failed, fall through to login
    }
  }

  // Auto-login from env vars
  const email = process.env.LINKSIGHT_EMAIL;
  const password = process.env.LINKSIGHT_PASSWORD;
  if (!email || !password) {
    throw new Error('No valid tokens and no LINKSIGHT_EMAIL/LINKSIGHT_PASSWORD configured');
  }

  const res = await fetch(`${resolveBaseUrl()}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`Login failed: ${err.error || res.statusText}`);
  }

  const data = await res.json();
  setTokens(data);
  return data.access_token;
}
