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
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
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
