/**
 * Auth API Client
 *
 * Axios client specifically for auth-service endpoints.
 * Includes token refresh interceptor for automatic token renewal.
 */

import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { emitAuthEvent } from './sessionEvents';

const authApi = axios.create({
  baseURL: import.meta.env.VITE_AUTH_API_URL || 'http://localhost:5000',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Track whether we're currently refreshing to avoid multiple simultaneous refresh requests
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}> = [];

/**
 * Process all queued requests after token refresh
 */
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
authApi.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Don't retry if:
    // 1. Already retried this request
    // 2. Request is to the refresh endpoint itself
    // 3. No response (network error)
    if (
      !originalRequest ||
      originalRequest._retry ||
      originalRequest.url?.includes('/auth/refresh') ||
      !error.response
    ) {
      return Promise.reject(error);
    }

    // Only handle 401 Unauthorized errors
    if (error.response.status !== 401) {
      return Promise.reject(error);
    }

    // If we're already refreshing, queue this request
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then(() => authApi(originalRequest))
        .catch((err) => Promise.reject(err));
    }

    // Mark request as retried and start refresh process
    originalRequest._retry = true;
    isRefreshing = true;

    try {
      // Attempt to refresh the token
      await authApi.get('/api/auth/refresh');

      // Token refreshed successfully, process queued requests
      processQueue();

      // Retry the original request
      return authApi(originalRequest);
    } catch (refreshError) {
      // Refresh failed, reject all queued requests
      processQueue(refreshError as AxiosError);

      const status = (refreshError as AxiosError).response?.status;
      if (status === 401 || status === 403) {
        emitAuthEvent({
          type: 'SESSION_EXPIRED',
          message: 'Your session has expired. Please sign in again.',
        });
      }

      // Clear authentication state (user will be redirected to login)
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default authApi;
