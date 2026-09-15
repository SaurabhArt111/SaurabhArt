const API_BASE = import.meta.env.VITE_API_BASE_URL || '';
const request = async (path, options = {}) => {
  const url = `${API_BASE}${path}`;
  const r = await fetch(url, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
  });
  if (!r.ok) {
    const body = await r.json().catch(() => ({}));
    throw new Error(body.error || `Request failed (${r.status})`);
  }
  return r.json();
};
export const api = {
  media: () => request('/api/media'),
  user: () => request('/api/user'),
  config: () => request('/api/config'),
  scan: () => request('/api/scan'),
  saveConfig: config => request('/api/config', { method: 'PUT', body: JSON.stringify(config) }),
  action: (action, id, value) => request('/api/user/action', { method: 'POST', body: JSON.stringify({ action, id, value }) }),
  reset: () => request('/api/reset', { method: 'POST' }),
  exportData: () => request('/api/export'),
  importData: data => request('/api/import', { method: 'POST', body: JSON.stringify(data) }),
};
