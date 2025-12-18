/**
 * API Service
 * Centralized axios instance with interceptors and error handling
 */

import axios from 'axios';
import { ENV } from '../config/env';
import { STORAGE_KEYS } from '../config/constants';
import logger from '../utils/logger';

// Create axios instance with default configuration
const apiClient = axios.create({
  baseURL: ENV.API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle common errors
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;

      switch (status) {
        case 401:
          // Unauthorized - clear auth and redirect to login
          localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
          localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
          break;
        case 404:
          logger.error('Resource not found', { url: error.config.url }, 'API');
          break;
        case 500:
          logger.error('Server error', { message: data?.message || 'Internal server error' }, 'API');
          break;
        default:
          logger.error('API Error', { message: data?.message || error.message }, 'API');
      }
    } else if (error.request) {
      // Request made but no response received
      logger.error('Network error: No response from server', error, 'API');
    } else {
      // Error setting up request
      logger.error('Request error', error, 'API');
    }

    return Promise.reject(error);
  }
);

export default apiClient;

