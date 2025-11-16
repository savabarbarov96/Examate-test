/**
 * Dashboard API Client
 *
 * Axios client specifically for dashboard-service endpoints.
 * Includes token refresh interceptor for automatic token renewal.
 */

import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import authApi from '@/utils/auth/api';

const dashboardApi = axios.create({
  baseURL: import.meta.env.VITE_DASHBOARD_API_URL || 'http://localhost:5002',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Track whether we're currently refreshing
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: AxiosError | null = null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve();
    }
  });

  failedQueue = [];
};

/**
 * Response interceptor for automatic token refresh
 */
dashboardApi.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // If 401 and not already retried, try refreshing token
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Wait for ongoing refresh
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => dashboardApi(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Use authApi to refresh the token
        await authApi.post('/api/auth/refresh');
        processQueue();
        return dashboardApi(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError as AxiosError);
        // Redirect to login handled by AuthProvider
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default dashboardApi;
