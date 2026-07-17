// services/api.js – Axios instance with proxy + cookie credentials
import axios from 'axios';

const BASE_URL =
  import.meta.env.VITE_API_URL || 'https://ekthaa-backend.onrender.com/api';

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,  // send/receive HTTP-only cookies
  timeout: 10000,
});

// ── Response interceptor: surface error messages cleanly ──
api.interceptors.response.use(
  res => res,
  err => {
    // If the request was for /auth/me and returned 401, it's expected when logged out.
    // Resolve it gracefully so it doesn't throw unhandled promise rejection errors in the console.
    if (err.response?.status === 401 && err.config?.url === '/auth/me') {
      return Promise.resolve({ data: { success: false, user: null } });
    }

    const message =
      err.response?.data?.message ||
      err.message ||
      'Something went wrong. Please try again.';

    // If 401 and not on an auth route, redirect to login
    if (
      err.response?.status === 401 &&
      !window.location.pathname.startsWith('/login') &&
      !window.location.pathname.startsWith('/register')
    ) {
      window.location.href = '/login';
    }

    return Promise.reject(new Error(message));
  }
);

export default api;
