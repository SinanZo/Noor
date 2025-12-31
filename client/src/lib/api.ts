'use client';
import axios from 'axios';
import { useAuth } from './auth';

const apiBase = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000/api/v1';

export const api = axios.create({
  baseURL: apiBase,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Attach Authorization header with JWT token from auth store
 * Call this before making authenticated API requests
 */
export function attachAuth() {
  const { token } = useAuth.getState();
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
}

/**
 * Request interceptor to automatically attach token
 */
api.interceptors.request.use(
  (config) => {
    const { token } = useAuth.getState();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor to handle auth errors
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear auth state on 401 Unauthorized
      useAuth.getState().clear();
      // Optionally redirect to login
      if (typeof window !== 'undefined') {
        window.location.href = '/en/auth/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
