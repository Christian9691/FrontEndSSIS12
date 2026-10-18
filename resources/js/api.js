/**
 * API Client for CuyoTech SSIS
 * Handles JSON serialization, credential passing, user identity headers, and HTTP error normalization.
 */

function getHeaders(custom = {}, url = '') {
  const headers = {
    'Accept': 'application/json',
    ...custom,
  };

  // Do not attach previous session user headers during explicit login
  if (!url.includes('/api/auth/login')) {
    try {
      const raw = localStorage.getItem('ssis_user');
      if (raw) {
        const user = JSON.parse(raw);
        if (user?.id) headers['X-User-Id'] = String(user.id);
        if (user?.role) headers['X-User-Role'] = String(user.role);
      }
    } catch (e) {}
  }

  return headers;
}

export const api = {
  get: async (url) => {
    const res = await fetch(url, {
      credentials: 'same-origin',
      headers: getHeaders({}, url),
    });
    if (!res.ok) throw await res.json();
    return res.json();
  },

  post: async (url, data = {}) => {
    const res = await fetch(url, {
      method: 'POST',
      credentials: 'same-origin',
      headers: getHeaders({ 'Content-Type': 'application/json' }, url),
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw json;
    return json;
  },

  patch: async (url, data = {}) => {
    const res = await fetch(url, {
      method: 'PATCH',
      credentials: 'same-origin',
      headers: getHeaders({ 'Content-Type': 'application/json' }, url),
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw json;
    return json;
  },
};
