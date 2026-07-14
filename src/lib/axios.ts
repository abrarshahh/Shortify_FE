import axios from 'axios';
import { toast } from '@/components/ui/toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8002';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT/session_id token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const sessionId = localStorage.getItem('shortify_session_id');
      if (sessionId && config.headers) {
        config.headers.Authorization = `Bearer ${sessionId}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle 401 and errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response ? error.response.status : null;
    const detail = error.response?.data?.detail || error.message;

    if (status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('shortify_session_id');
        localStorage.removeItem('shortify_user');
        toast.error('Session expired. Please log in again.');
        // Redirect to login page after a brief delay so toast is visible
        setTimeout(() => {
          window.location.href = '/login';
        }, 1000);
      }
    } else {
      // Don't fail silently
      toast.error(`API Error: ${detail}`);
    }
    return Promise.reject(error);
  }
);

export default api;
