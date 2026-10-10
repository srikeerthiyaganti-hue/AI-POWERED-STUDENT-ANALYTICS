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
      sessionStorage.removeItem('codebuffet_access_token');
    }

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const errorMsg = data?.detail || `API error (${response.status}): ${response.statusText}`;
      throw new Error(errorMsg);
    }

    return data;
  } catch (error) {
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
  getCohortAnalytics: () => request('/api/institution/analytics/cohort'),
  getInstitutionDepartments: () => request('/api/institution/departments'),
  getInstitutionTrends: (range) => request(`/api/institution/trends?range_filter=${encodeURIComponent(range || 'Last 6 Months')}`),
  
  getInstitutionStudents: (options = {}) => {
    // Supports both legacy argument list or options object
    let paramsObj = {};
    if (typeof options === 'string') {
      paramsObj = { search: options };
    } else {
      paramsObj = options || {};
    }

    const params = new URLSearchParams();
    if (paramsObj.search) params.append('search', paramsObj.search);
    if (paramsObj.riskBand) params.append('risk_band', paramsObj.riskBand);
    if (paramsObj.academicRisk) params.append('academic_risk', paramsObj.academicRisk);
    if (paramsObj.placementRisk) params.append('placement_risk', paramsObj.placementRisk);
    if (paramsObj.department) params.append('department', paramsObj.department);
    if (paramsObj.mentor) params.append('mentor', paramsObj.mentor);
    if (paramsObj.recordType) params.append('record_type', paramsObj.recordType);
    if (paramsObj.semester) params.append('semester', paramsObj.semester);
    if (paramsObj.year) params.append('year', paramsObj.year);
    if (paramsObj.attendanceRange) params.append('attendance_range', paramsObj.attendanceRange);
    if (paramsObj.minCgpa !== undefined && paramsObj.minCgpa !== '') params.append('min_cgpa', paramsObj.minCgpa);
    if (paramsObj.maxCgpa !== undefined && paramsObj.maxCgpa !== '') params.append('max_cgpa', paramsObj.maxCgpa);
    if (paramsObj.sortBy) params.append('sort_by', paramsObj.sortBy);
    if (paramsObj.sortOrder) params.append('sort_order', paramsObj.sortOrder);
    if (paramsObj.page) params.append('page', paramsObj.page);
    if (paramsObj.pageSize) params.append('page_size', paramsObj.pageSize);
    if (paramsObj.limit) params.append('limit', paramsObj.limit);

    const qs = params.toString() ? `?${params.toString()}` : '';
    return request(`/api/institution/students${qs}`);
  },

  getMentors: () => request('/api/institution/mentors'),

  simulateCohort: (simulationParams) =>
    request('/api/institution/simulate-cohort', {
      method: 'POST',
      body: JSON.stringify(simulationParams),
    }),

  getModelStatus: () => request('/api/institution/model-status'),

  getExportStudentsUrl: (options = {}) => {
    const params = new URLSearchParams();
    if (options.search) params.append('search', options.search);
    if (options.riskBand) params.append('risk_band', options.riskBand);
    if (options.department) params.append('department', options.department);
    if (options.mentor) params.append('mentor', options.mentor);
    if (options.recordType) params.append('record_type', options.recordType);
    const qs = params.toString() ? `?${params.toString()}` : '';
    return `${API_BASE}/api/institution/students/export${qs}`;
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

  createStudent: (studentData) =>
    request('/api/institution/students', {
      method: 'POST',
      body: JSON.stringify(studentData),
    }),

  assignMentor: (rollNo, mentorName) =>
    request('/api/institution/students/assign-mentor', {
      method: 'POST',
      body: JSON.stringify({ roll_no: rollNo, mentor_name: mentorName }),
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
