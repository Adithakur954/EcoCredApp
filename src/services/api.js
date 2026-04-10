import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DEPLOYED_API_BASE_URL = 'https://ecocred-pebe.onrender.com';
const envBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL?.trim();

// Prefer env override; otherwise use deployed backend.
export const API_BASE_URL = envBaseUrl || DEPLOYED_API_BASE_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('ecocred_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      const method = error?.config?.method?.toUpperCase() || 'GET';
      const baseURL = error?.config?.baseURL || API_BASE_URL;
      const url = error?.config?.url || '';
      console.log(`Network Error: ${method} ${baseURL}${url}`);
    }
    return Promise.reject(error);
  }
);

// ─── AUTH ─────────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (name, email, password) =>
    api.post('/api/auth/register', { name, email, password }),
  login: (email, password) =>
    api.post('/api/auth/login', { email, password }),
  getMe: () => api.get('/api/auth/me'),
  updatePassword: (currentPassword, newPassword) =>
    api.put('/api/auth/updatepassword', { currentPassword, newPassword }),
  logout: () => api.post('/api/auth/logout'),
};

// ─── USERS ─────────────────────────────────────────────────────────────────────
export const usersAPI = {
  getAll: () => api.get('/api/users'),
  getById: (id) => api.get(`/api/users/${id}`),
  create: (name, email, password) =>
    api.post('/api/users', { name, email, password }),
  update: (id, data) => api.put(`/api/users/${id}`, data),
  delete: (id) => api.delete(`/api/users/${id}`),
  search: (query) => api.get(`/api/users/search?query=${query}`),
};

// ─── DEVICES ───────────────────────────────────────────────────────────────────
export const devicesAPI = {
  getAll: () => api.get('/api/devices'),
  getById: (id) => api.get(`/api/devices/${id}`),
  getByUser: (userId) => api.get(`/api/devices/user/${userId}`),
  getStats: () => api.get('/api/devices/stats'),
  getByStatus: (status) => api.get(`/api/devices/status/${status}`),
  getByType: (type) => api.get(`/api/devices/type/${type}`),
  search: (query) => api.get(`/api/devices/search?query=${query}`),
  getRecentlyActive: (limit = 10) =>
    api.get(`/api/devices/recent?limit=${limit}`),
  create: (data) => api.post('/api/devices', data),
  update: (id, data) => api.put(`/api/devices/${id}`, data),
  updateStatus: (id, status) =>
    api.patch(`/api/devices/${id}/status`, { status }),
  delete: (id) => api.delete(`/api/devices/${id}`),
  bulkUpdateStatus: (device_ids, status) =>
    api.patch('/api/devices/bulk/status', { device_ids, status }),
};

// ─── USAGE ─────────────────────────────────────────────────────────────────────
export const usageAPI = {
  logEvent: (user_id, resource_type, amount, device_id = null, timestamp = null) =>
    api.post('/api/usage', { user_id, device_id, resource_type, amount, timestamp }),
  getSummary: (userId) => api.get(`/api/usage/summary/${userId}`),
};

// ─── GAMIFICATION ──────────────────────────────────────────────────────────────
export const gamificationAPI = {
  getLeaderboard: () => api.get('/api/gamification/leaderboard'),
  getUserStatus: (userId) => api.get(`/api/gamification/status/${userId}`),
};

// ─── TIPS ──────────────────────────────────────────────────────────────────────
export const tipsAPI = {
  getTips: (category = null) => {
    const url = category ? `/api/tips?category=${category}` : '/api/tips';
    return api.get(url);
  },
};

// ─── DATASET ANALYSIS ─────────────────────────────────────────────────────────
// All dataset endpoints are on the same backend (API_BASE_URL above)
export const datasetAPI = {
  getSummary: () => api.get('/api/dataset/summary'),
  getTimeSeries: (range = '7d') => api.get(`/api/dataset/timeseries?range=${range}`),
  getApplianceBreakdown: () => api.get('/api/dataset/appliances'),
  getWeatherCorrelation: () => api.get('/api/dataset/weather'),
};

export default api;
