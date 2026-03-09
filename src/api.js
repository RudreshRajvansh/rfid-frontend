const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');
const REQUEST_TIMEOUT = 15000;

function getApiKey() {
  return localStorage.getItem('rfid_api_key') || '';
}

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (options.auth !== false) {
    const key = getApiKey();
    if (key) headers['X-API-Key'] = key;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

  try {
    const res = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal,
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      const err = new Error(body.error || `Request failed (${res.status})`);
      err.status = res.status;
      throw err;
    }

    return await res.json();
  } catch (e) {
    if (e.name === 'AbortError') {
      const err = new Error('Request timed out. Please check your connection.');
      err.status = 408;
      throw err;
    }
    throw e;
  } finally {
    clearTimeout(timeoutId);
  }
}

export const api = {
  // Health
  health: () => request('/', { auth: false }),

  // Dashboard
  getStats: () => request('/api/stats', { auth: false }),

  // Scan
  scan: (uid, macAddress) =>
    request('/api/scan', {
      method: 'POST',
      body: JSON.stringify({ uid, mac_address: macAddress }),
      auth: false,
    }),

  // Attendance
  getDailyReport: (date, classId) =>
    request(`/api/attendance/daily?date=${encodeURIComponent(date)}&class_id=${encodeURIComponent(classId)}`, { auth: false }),

  // Classes
  getClasses: () => request('/api/classes'),
  getClass: (id) => request(`/api/class?id=${encodeURIComponent(id)}`),
  createClass: (data) =>
    request('/api/classes', { method: 'POST', body: JSON.stringify(data) }),
  updateClass: (id, data) =>
    request(`/api/class?id=${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteClass: (id) =>
    request(`/api/class?id=${encodeURIComponent(id)}`, { method: 'DELETE' }),

  // Students
  getStudents: (classId) => {
    const q = classId ? `?class_id=${encodeURIComponent(classId)}` : '';
    return request(`/api/students${q}`);
  },
  getStudent: (id) => request(`/api/student?id=${encodeURIComponent(id)}`),
  createStudent: (data) =>
    request('/api/students', { method: 'POST', body: JSON.stringify(data) }),
  updateStudent: (id, data) =>
    request(`/api/student?id=${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteStudent: (id) =>
    request(`/api/student?id=${encodeURIComponent(id)}`, { method: 'DELETE' }),

  // Logs
  getLogs: (params = {}) => {
    const q = new URLSearchParams();
    if (params.limit) q.set('limit', params.limit);
    if (params.offset != null) q.set('offset', params.offset);
    if (params.date) q.set('date', params.date);
    if (params.uid) q.set('uid', params.uid);
    return request(`/api/logs?${q.toString()}`);
  },
  deleteLog: (uid, date) =>
    request(`/api/log?uid=${encodeURIComponent(uid)}&date=${encodeURIComponent(date)}`, { method: 'DELETE' }),
};
