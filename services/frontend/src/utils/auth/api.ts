/**
 * Auth API Client
 *
 * Axios client specifically for auth-service endpoints.
 * Does NOT use token refresh interceptor to avoid circular dependencies.
 */

import axios from 'axios';

const authApi = axios.create({
  baseURL: import.meta.env.VITE_AUTH_API_URL || 'http://localhost:5000',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default authApi;
