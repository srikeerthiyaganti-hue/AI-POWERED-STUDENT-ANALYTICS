// Frontend API Service
// Reads API Base URL from Vite environment variable with safe localhost fallback

export const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5002/api').replace(/\/+$/, '');

/**
 * Checks backend health status
 * Returns a unified object with `isOnline: boolean`, `data: object`, and `error: string|null`
 */
export async function checkBackendHealth() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Server returned HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      isOnline: true,
      data,
      error: null
    };
  } catch (err) {
    return {
      isOnline: false,
      data: null,
      error: err.name === 'AbortError' ? 'Connection timed out' : err.message
    };
  }
}

/**
 * Fetches cohort analytics overview metrics and distributions
 */
export async function fetchAnalyticsOverview() {
  try {
    const response = await fetch(`${API_BASE_URL}/analytics/overview`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });

    if (!response.ok) {
      throw new Error(`Failed to load analytics: HTTP ${response.status}`);
    }

    const json = await response.json();
    return {
      success: true,
      data: json.data || null,
      error: null
    };
  } catch (err) {
    return {
      success: false,
      data: null,
      error: err.message
    };
  }
}

/**
 * Fetches paginated and filtered student list
 */
export async function fetchStudents(params = {}) {
  try {
    const query = new URLSearchParams();
    if (params.page) query.append('page', params.page);
    if (params.limit) query.append('limit', params.limit);
    if (params.branch) query.append('branch', params.branch);
    if (params.riskLevel) query.append('riskLevel', params.riskLevel);
    if (params.placementStatus) query.append('placementStatus', params.placementStatus);
    if (params.search) query.append('search', params.search);
    if (params.minScore) query.append('minScore', params.minScore);
    if (params.maxScore) query.append('maxScore', params.maxScore);

    const queryString = query.toString();
    const url = `${API_BASE_URL}/students${queryString ? `?${queryString}` : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });

    if (!response.ok) {
      throw new Error(`Failed to load students: HTTP ${response.status}`);
    }

    const json = await response.json();
    return {
      success: true,
      data: json.data || [],
      pagination: json.pagination || { total: 0, page: 1, limit: 10, totalPages: 1 },
      error: null
    };
  } catch (err) {
    return {
      success: false,
      data: [],
      pagination: { total: 0, page: 1, limit: 10, totalPages: 1 },
      error: err.message
    };
  }
}

/**
 * Fetches detailed student profile with complete score breakdown and explainable reasons
 */
export async function fetchStudentDetail(idOrRegNo) {
  try {
    const response = await fetch(`${API_BASE_URL}/students/${encodeURIComponent(idOrRegNo)}`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });

    if (!response.ok) {
      throw new Error(`Failed to load student details: HTTP ${response.status}`);
    }

    const json = await response.json();
    return {
      success: true,
      data: json.data || null,
      error: null
    };
  } catch (err) {
    return {
      success: false,
      data: null,
      error: err.message
    };
  }
}

/**
 * Fetches personalized recommendations for a specific student
 */
export async function fetchStudentRecommendations(idOrRegNo) {
  try {
    const response = await fetch(`${API_BASE_URL}/students/${encodeURIComponent(idOrRegNo)}/recommendations`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });

    if (!response.ok) {
      throw new Error(`Failed to load student recommendations: HTTP ${response.status}`);
    }

    const json = await response.json();
    return {
      success: true,
      data: json.data || null,
      error: null
    };
  } catch (err) {
    return {
      success: false,
      data: null,
      error: err.message
    };
  }
}

/**
 * Fetches cohort-wide recommendations with optional filtering
 */
export async function fetchAllRecommendations(params = {}) {
  try {
    const query = new URLSearchParams();
    if (params.priority) query.append('priority', params.priority);
    if (params.factor) query.append('factor', params.factor);
    if (params.branch) query.append('branch', params.branch);
    if (params.search) query.append('search', params.search);
    if (params.page) query.append('page', params.page);
    if (params.limit) query.append('limit', params.limit);

    const queryString = query.toString();
    const url = `${API_BASE_URL}/recommendations${queryString ? `?${queryString}` : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });

    if (!response.ok) {
      throw new Error(`Failed to load recommendations: HTTP ${response.status}`);
    }

    const json = await response.json();
    return {
      success: true,
      data: json.data || [],
      meta: json.meta || { total: 0, distribution: { high: 0, medium: 0, low: 0 } },
      error: null
    };
  } catch (err) {
    return {
      success: false,
      data: [],
      meta: { total: 0, distribution: { high: 0, medium: 0, low: 0 } },
      error: err.message
    };
  }
}

/**
 * Fetches faculty interventions with optional filtering and pagination
 */
export async function fetchInterventions(params = {}) {
  try {
    const query = new URLSearchParams();
    if (params.status) query.append('status', params.status);
    if (params.priority) query.append('priority', params.priority);
    if (params.branch) query.append('branch', params.branch);
    if (params.student) query.append('student', params.student);
    if (params.search) query.append('search', params.search);
    if (params.page) query.append('page', params.page);
    if (params.limit) query.append('limit', params.limit);

    const queryString = query.toString();
    const url = `${API_BASE_URL}/interventions${queryString ? `?${queryString}` : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });

    if (!response.ok) {
      throw new Error(`Failed to load interventions: HTTP ${response.status}`);
    }

    const json = await response.json();
    return {
      success: true,
      data: json.data || [],
      pagination: json.pagination || { total: 0, page: 1, limit: 10, totalPages: 1 },
      storage: json.storage || { mode: 'synthetic_fallback', isPersistent: false },
      error: null
    };
  } catch (err) {
    return {
      success: false,
      data: [],
      pagination: { total: 0, page: 1, limit: 10, totalPages: 1 },
      storage: { mode: 'synthetic_fallback', isPersistent: false },
      error: err.message
    };
  }
}

/**
 * Fetches summary statistics for interventions
 */
export async function fetchInterventionStats() {
  try {
    const response = await fetch(`${API_BASE_URL}/interventions/stats`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });

    if (!response.ok) {
      throw new Error(`Failed to load intervention stats: HTTP ${response.status}`);
    }

    const json = await response.json();
    return {
      success: true,
      data: json.data || null,
      error: null
    };
  } catch (err) {
    return {
      success: false,
      data: null,
      error: err.message
    };
  }
}

/**
 * Creates a new faculty intervention
 */
export async function createIntervention(payload) {
  try {
    const response = await fetch(`${API_BASE_URL}/interventions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const json = await response.json();
    if (!response.ok) {
      throw new Error(json.message || `Failed to create intervention: HTTP ${response.status}`);
    }

    return {
      success: true,
      data: json.data,
      error: null
    };
  } catch (err) {
    return {
      success: false,
      data: null,
      error: err.message
    };
  }
}

/**
 * Updates an intervention (status, notes, actionPlan, resolutionNotes, etc.)
 */
export async function updateIntervention(id, updates) {
  try {
    const response = await fetch(`${API_BASE_URL}/interventions/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(updates)
    });

    const json = await response.json();
    if (!response.ok) {
      throw new Error(json.message || `Failed to update intervention: HTTP ${response.status}`);
    }

    return {
      success: true,
      data: json.data,
      error: null
    };
  } catch (err) {
    return {
      success: false,
      data: null,
      error: err.message
    };
  }
}

/**
 * Deletes an intervention
 */
export async function deleteIntervention(id) {
  try {
    const response = await fetch(`${API_BASE_URL}/interventions/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: { 'Accept': 'application/json' }
    });

    const json = await response.json();
    if (!response.ok) {
      throw new Error(json.message || `Failed to delete intervention: HTTP ${response.status}`);
    }

    return {
      success: true,
      error: null
    };
  } catch (err) {
    return {
      success: false,
      error: err.message
    };
  }
}

/**
 * Generates AI student success insights via Gemini Copilot
 * POST /api/ai/student-insights
 */
export async function generateStudentInsights({ registrationNumber, studentName, question }) {
  try {
    const response = await fetch(`${API_BASE_URL}/ai/student-insights`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        registrationNumber,
        studentName,
        question: question ? question.trim() : undefined
      })
    });

    const json = await response.json();
    if (!response.ok) {
      const errorObj = new Error(json.message || `AI Copilot error: HTTP ${response.status}`);
      errorObj.code = json.code;
      throw errorObj;
    }

    return {
      success: true,
      data: json.data,
      error: null
    };
  } catch (err) {
    return {
      success: false,
      data: null,
      code: err.code || 'REQUEST_FAILED',
      error: err.message
    };
  }
}


