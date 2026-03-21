const DEFAULT_BASE_URL = 'http://localhost:3001/api';

export function resolveBaseUrl() {
  return process.env.LINKSIGHT_API_URL || DEFAULT_BASE_URL;
}
