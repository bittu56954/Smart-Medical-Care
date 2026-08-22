import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? 'http://127.0.0.1:5001/api' : '/api');

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor to attach JWT Auth token to outgoing requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('mediscan_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor to handle 401 Unauthorized globally & clear invalid tokens
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn('[MEDISCAN API] 401 Unauthorized detected. Clearing stale auth token.');
      localStorage.removeItem('mediscan_token');
      localStorage.removeItem('mediscan_user_data');
      window.dispatchEvent(new Event('mediscan_auth_unauthorized'));
    }
    return Promise.reject(error);
  }
);

// Auth Endpoints
export const authService = {
  register: (userData) => api.post('/auth/register', userData),
  verifyOTP: (data) => api.post('/auth/verify-otp', data),
  resendOTP: (data) => api.post('/auth/resend-otp', data),
  login: (credentials) => api.post('/auth/login', credentials),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  resetPassword: (data) => api.post('/auth/reset-password', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/change-password', data)
};

// Medicine Endpoints
export const medicineService = {
  scanMedicine: (formData) =>
    api.post('/medicines/scan', formData, {
      timeout: 30000,
      headers: {
        'Content-Type': formData instanceof FormData ? 'multipart/form-data' : 'application/json'
      }
    }),
  saveMedicine: (data) => api.post('/medicines/save', data),
  getUserMedicines: () => api.get('/medicines'),
  getMedicineById: (id) => api.get(`/medicines/${id}`),
  updateMedicine: (id, data) => api.put(`/medicines/${id}`, data),
  deleteMedicine: (id) => api.delete(`/medicines/${id}`)
};

// History Endpoints
export const historyService = {
  getScanHistory: () => api.get('/history'),
  deleteHistoryItem: (id) => api.delete(`/history/${id}`),
  clearHistory: () => api.delete('/history/clear-all')
};

// Reminder Endpoints
export const reminderService = {
  getReminders: () => api.get('/reminders'),
  createReminder: (data) => api.post('/reminders', data),
  updateReminder: (id, data) => api.put(`/reminders/${id}`, data),
  deleteReminder: (id) => api.delete(`/reminders/${id}`)
};

// Admin Endpoints
export const adminService = {
  getAdminStats: () => api.get('/admin/stats'),
  getAllUsers: () => api.get('/admin/users'),
  updateUserRole: (id, role) => api.put(`/admin/users/${id}/role`, { role }),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  getAllMedicines: () => api.get('/admin/medicines'),
  getAllScans: () => api.get('/admin/scans')
};

// Face Scan Endpoints & Local Storage Helper
export const faceScanService = {
  getFaceScans: () => {
    try {
      const stored = localStorage.getItem('mediscan_face_scans');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  },
  getTotalScanCount: () => {
    try {
      // 1. Calculate daily organic growth since launch date (Aug 1, 2026)
      const baseDate = new Date(2026, 7, 1);
      const today = new Date();
      const diffTime = Math.max(0, today.getTime() - baseDate.getTime());
      const daysPassed = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      // ~35 organic scans per day
      const organicDailyCount = daysPassed * 35;
      
      // 2. Add manual scan bonus and user saved scans
      const manualBonus = parseInt(localStorage.getItem('mediscan_manual_scan_bonus') || '0', 10);
      const userScansCount = faceScanService.getFaceScans().length;
      
      return 2840 + organicDailyCount + userScansCount + manualBonus;
    } catch {
      return 3500;
    }
  },
  incrementTotalScanCount: () => {
    try {
      const currentBonus = parseInt(localStorage.getItem('mediscan_manual_scan_bonus') || '0', 10);
      const updatedBonus = currentBonus + 1;
      localStorage.setItem('mediscan_manual_scan_bonus', updatedBonus.toString());
      
      const newTotal = faceScanService.getTotalScanCount();
      window.dispatchEvent(new CustomEvent('faceScanCompleted', { detail: { count: newTotal } }));
      return newTotal;
    } catch {
      return 3501;
    }
  },
  saveFaceScan: (scanData) => {
    try {
      const scans = faceScanService.getFaceScans();
      const newScan = {
        _id: 'face_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
        scanDate: new Date().toISOString(),
        ...scanData
      };
      const updated = [newScan, ...scans];
      localStorage.setItem('mediscan_face_scans', JSON.stringify(updated));
      faceScanService.incrementTotalScanCount();
      return newScan;
    } catch (e) {
      console.error('Error saving face scan:', e);
      return scanData;
    }
  },
  deleteFaceScan: (id) => {
    try {
      const scans = faceScanService.getFaceScans();
      const updated = scans.filter(s => s._id !== id);
      localStorage.setItem('mediscan_face_scans', JSON.stringify(updated));
      return true;
    } catch {
      return false;
    }
  }
};

export default api;
