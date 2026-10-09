/**
 * CODEBUFFET — Frontend API Client & Backend Integration Service
 * Connects React UI to FastAPI backend with JWT bearer auth,
 * error normalization, and offline resiliency.
 */

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

function getAuthHeader() {
  const token = sessionStorage.getItem('codebuffet_access_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...options.headers,
  };

  try {
    const response = await fetch(url, { ...options, headers });
    
    if (response.status === 401) {
      // Clear token on 401 Unauthorized
      sessionStorage.removeItem('codebuffet_access_token');
    }

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const errorMsg = data?.detail || `API error (${response.status}): ${response.statusText}`;
      throw new Error(errorMsg);
    }

    return data;
  } catch (error) {
    // If backend is offline/unreachable, propagate meaningful error
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error(`Unable to reach CODEBUFFET API at ${API_BASE}. Ensure backend is running.`);
    }
    throw error;
  }
}

export const api = {
  // System Health
  checkHealth: () => request('/api/health'),

  // Authentication
  login: async (identifier, password, role) => {
    const data = await request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier, password, role }),
    });
    if (data?.access_token) {
      sessionStorage.setItem('codebuffet_access_token', data.access_token);
    }
    return data;
  },

  logout: async () => {
    try {
      await request('/api/auth/logout', { method: 'POST' });
    } catch {
      // Ignore network errors on logout
    } finally {
      sessionStorage.removeItem('codebuffet_access_token');
      sessionStorage.removeItem('codebuffet_user');
    }
  },

  getMe: () => request('/api/auth/me'),

  // Institution Endpoints
  getInstitutionSummary: () => request('/api/institution/summary'),
  getInstitutionDepartments: () => request('/api/institution/departments'),
  getInstitutionTrends: (range) => request(`/api/institution/trends?range_filter=${encodeURIComponent(range || 'Last 6 Months')}`),
  getInstitutionStudents: (search = '', riskBand = '', department = '', mentor = '') => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (riskBand) params.append('risk_band', riskBand);
    if (department) params.append('department', department);
    if (mentor) params.append('mentor', mentor);
    const qs = params.toString() ? `?${params.toString()}` : '';
    return request(`/api/institution/students${qs}`);
  },
  getInterventions: (mentor = '', category = '') => {
    const params = new URLSearchParams();
    if (mentor) params.append('mentor', mentor);
    if (category) params.append('category', category);
    const qs = params.toString() ? `?${params.toString()}` : '';
    return request(`/api/institution/interventions${qs}`);
  },
  createIntervention: (data) =>
    request('/api/institution/interventions', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  toggleInstitutionIntervention: (taskId) =>
    request(`/api/institution/interventions/${taskId}/toggle`, {
      method: 'POST',
    }),

  // Student Endpoints
  getStudentDashboard: (rollNo) => {
    const query = rollNo ? `?roll_no=${encodeURIComponent(rollNo)}` : '';
    return request(`/api/student/dashboard${query}`);
  },

  simulateStudentScore: (params) =>
    request('/api/student/simulate', {
      method: 'POST',
      body: JSON.stringify(params),
    }),

  toggleTaskStatus: (taskId) =>
    request(`/api/student/tasks/${taskId}/toggle`, {
      method: 'POST',
    }),
};

export default api;
