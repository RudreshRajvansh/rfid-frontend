const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');

function getApiKey() {
  return localStorage.getItem('rfid_api_key') || '';
}

function getStudentToken() {
  return localStorage.getItem('student_token') || '';
}

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (options.auth !== false && options.studentAuth !== true) {
    const key = getApiKey();
    if (key) headers['X-API-Key'] = key;
  }

  if (options.studentAuth) {
    const token = getStudentToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15_000);

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

    if (options.raw) return res;
    return await res.json();
  } catch (e) {
    if (e.name === 'AbortError') {
      const err = new Error('Request timed out');
      err.status = 408;
      throw err;
    }
    throw e;
  } finally {
    clearTimeout(timeoutId);
  }
}

export const api = {
  health: () => request('/', { auth: false }),

  getStats: () => request('/api/stats', { auth: false }),
  getWeeklyStats: (classId) => {
    const q = classId ? `?class_id=${encodeURIComponent(classId)}` : '';
    return request(`/api/stats/weekly${q}`, { auth: false });
  },

  scan: (uid, macAddress) =>
    request('/api/scan', {
      method: 'POST',
      body: JSON.stringify({ uid, mac_address: macAddress }),
      auth: false,
    }),

  getDailyReport: (date, classId) =>
    request(`/api/attendance/daily?date=${encodeURIComponent(date)}&class_id=${encodeURIComponent(classId)}`, { auth: false }),
  getLiveAttendance: (classId) => {
    const q = classId ? `?class_id=${encodeURIComponent(classId)}` : '';
    return request(`/api/attendance/live${q}`, { auth: false });
  },
  getAttendanceRange: (classId, from, to) =>
    request(`/api/attendance/range?class_id=${encodeURIComponent(classId)}&from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`),
  exportAttendance: (classId, date) =>
    request(`/api/export?class_id=${encodeURIComponent(classId)}&date=${encodeURIComponent(date)}`, { raw: true }),

  getClasses: () => request('/api/classes'),
  getClass: (id) => request(`/api/class?id=${encodeURIComponent(id)}`),
  createClass: (data) =>
    request('/api/classes', { method: 'POST', body: JSON.stringify(data) }),
  updateClass: (id, data) =>
    request(`/api/class?id=${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteClass: (id) =>
    request(`/api/class?id=${encodeURIComponent(id)}`, { method: 'DELETE' }),

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
  getStudentHistory: (uid, limit = 30, offset = 0) =>
    request(`/api/student/history?uid=${encodeURIComponent(uid)}&limit=${limit}&offset=${offset}`),

  getLogs: (params = {}) => {
    const q = new URLSearchParams();
    if (params.limit) q.set('limit', params.limit);
    if (params.offset != null) q.set('offset', params.offset);
    if (params.date) q.set('date', params.date);
    if (params.uid) q.set('uid', params.uid);
    if (params.scan_type) q.set('scan_type', params.scan_type);
    return request(`/api/logs?${q.toString()}`);
  },
  deleteLog: (uid, date) =>
    request(`/api/log?uid=${encodeURIComponent(uid)}&date=${encodeURIComponent(date)}`, { method: 'DELETE' }),

  getDevices: () => request('/api/devices'),
  createDevice: (data) =>
    request('/api/devices', { method: 'POST', body: JSON.stringify(data) }),

  studentLogin: (rollNumber, dateOfBirth) =>
    request('/api/student/login', {
      method: 'POST',
      body: JSON.stringify({ roll_number: rollNumber, date_of_birth: dateOfBirth }),
      auth: false,
    }),
  studentMe: () => request('/api/student/me', { studentAuth: true }),
  studentAttendance: (limit = 30) =>
    request(`/api/student/attendance?limit=${limit}`, { studentAuth: true }),
  studentLocation: (latitude, longitude) =>
    request('/api/student/location', {
      method: 'POST',
      body: JSON.stringify({ latitude, longitude }),
      studentAuth: true,
    }),
  studentToday: () => request('/api/student/today', { studentAuth: true }),
};
