import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only redirect on 401 if we're NOT already on the login page
    // and if there was a token (meaning user was logged in)
    if (error.response?.status === 401) {
      const hadToken = localStorage.getItem("token");
      const isLoginPage = window.location.pathname === "/login";
      
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      
      // Only redirect if user was logged in and not on login page
      if (hadToken && !isLoginPage) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData) => api.post("/auth/register", userData),
  login: (credentials) => api.post("/auth/login", credentials),
  logout: () => api.post("/auth/logout"),
  getCurrentUser: () => api.get("/auth/me"),
  refreshToken: (refreshToken) => api.post("/auth/refresh", { refreshToken }),
  forgotPassword: (data) => api.post("/auth/forgot-password", data),
  verifyOtp: (data) => api.post("/auth/verify-otp", data),
  resetPassword: (data) => api.post("/auth/reset-password", data),
};

// Interview API
export const interviewAPI = {
  generate: (interviewData) => api.post("/interviews/generate", interviewData),
  getAll: (params = {}) => api.get("/interviews", { params }),
  getById: (id) => api.get(`/interviews/${id}`),
  start: (id) => api.post(`/interviews/${id}/start`),
  complete: (id) => api.post(`/interviews/${id}/complete`),
  delete: (id) => api.delete(`/interviews/${id}`),
  getStats: () => api.get("/interviews/stats/overview"),
};

// Answer API
export const answerAPI = {
  submitAll: (data) => api.post("/answers/submit-all", data),
  submitBulk: (data) => api.post("/answers/bulk", data),
  submit: (answerData) => api.post("/answers", answerData),
  getByInterview: (interviewId) => api.get(`/answers/interview/${interviewId}`),
  getById: (id) => api.get(`/answers/${id}`),
  update: (id, data) => api.put(`/answers/${id}`, data),
  delete: (id) => api.delete(`/answers/${id}`),
  getStats: (interviewId) => api.get(`/answers/stats/${interviewId}`),
  updateFacialAnalysis: (interviewId, facialData) => api.patch(`/answers/interview/${interviewId}/facial-analysis`, facialData),
};

// Facial Analysis API
export const facialAnalysisAPI = {
  analyze: (videoFile) => {
    console.log('📤 Sending video for facial analysis (Postman format):', {
      name: videoFile.name,
      size: videoFile.size,
      type: videoFile.type
    });

    // Create FormData exactly like Postman
    const formData = new FormData();

    // Send original file format (WebM is fine, Django can handle it)
    console.log('📤 Sending original video file to Django:', {
      name: videoFile.name,
      size: videoFile.size,
      type: videoFile.type,
      isOriginalFormat: true
    });

    // Add original file to FormData
    formData.append('video', videoFile);

    // Send exactly like Django test script (with trailing slash)
    const DJANGO_URL = import.meta.env.VITE_DJANGO_URL || 'http://localhost:8000';
    return axios.post(`${DJANGO_URL}/api/facial-analysis/`, formData, {
      timeout: 60000,
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        console.log('📤 Upload progress:', percentCompleted + '%');
      }
    }).then(response => {
      console.log('📥 Facial analysis SUCCESS:', response.data);
      return response;
    }).catch(error => {
      console.error('📥 Facial analysis FAILED:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      throw error;
    });
  },

  // Get facial analysis data for an interview
  getByInterview: (interviewId) => {
    console.log('📥 Fetching facial analysis for interview:', interviewId);
    return api.get(`/facial-analysis/interview/${interviewId}`).then(response => {
      console.log('📥 Facial analysis data received:', response.data);
      return response;
    }).catch(error => {
      console.error('📥 Failed to fetch facial analysis:', {
        status: error.response?.status,
        message: error.message
      });
      throw error;
    });
  },
};

// Results API
export const resultsAPI = {
  generate: (interviewId) => api.post(`/results/generate/${interviewId}`),
  getByInterview: (interviewId) => api.get(`/results/interview/${interviewId}`),
  getAll: (params = {}) => api.get("/results", { params }),
  getAnalytics: () => api.get("/results/analytics/performance"),
  compare: (id1, id2) => api.get(`/results/compare/${id1}/${id2}`),
};

// User API
export const userAPI = {
  getProfile: () => api.get("/users/profile"),
  updateProfile: (data) => api.put("/users/profile", data),
  changePassword: (data) => api.put("/auth/change-password", data),
  updateProfileImage: (data) => {
    if (data instanceof FormData) {
      return api.put("/users/profile-image", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    } else {
      return api.put("/users/profile-image", data);
    }
  },
  getStats: () => api.get("/users/stats"),
  getInterviews: (params = {}) => api.get("/users/interviews", { params }),
  getResults: (params = {}) => api.get("/users/results", { params }),
  deleteAccount: () => api.delete("/users/account"),
};

// Health check
export const healthAPI = {
  check: () => axios.get(`${API_BASE_URL.replace("/api", "")}/health`),
};

export default api;
