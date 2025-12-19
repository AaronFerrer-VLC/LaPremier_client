/**
 * API Service
 * Centralized axios instance with interceptors and error handling
 */

import axios from 'axios';
import { ENV } from '../config/env';
import logger from '../utils/logger';
import { safeGetItem, safeRemoveItem } from '../utils/storage';

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // Start with 1 second

/**
 * Calculate delay for retry with exponential backoff
 * @param {number} retryCount - Current retry attempt (0-indexed)
 * @returns {number} Delay in milliseconds
 */
const getRetryDelay = (retryCount) => {
  return RETRY_DELAY * Math.pow(2, retryCount);
};

/**
 * Check if error should be retried
 * @param {Error} error - Axios error object
 * @returns {boolean} Whether to retry
 */
const shouldRetry = (error) => {
  // Don't retry if request was cancelled
  if (axios.isCancel(error)) return false;
  
  // Don't retry if there's no response (network error)
  if (!error.response) {
    // Retry network errors (timeout, network failure)
    return error.code === 'ECONNABORTED' || error.code === 'ERR_NETWORK' || !error.request;
  }
  
  // Retry on 5xx errors (server errors)
  const status = error.response.status;
  return status >= 500 && status < 600;
};

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
    const token = safeGetItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor with retry logic
apiClient.interceptors.response.use(
  (response) => {
    // Reset retry count on success
    if (response.config) {
      response.config.__retryCount = 0;
    }
    return response;
  },
  async (error) => {
    const config = error.config || {};
    
    // Initialize retry count if not present
    config.__retryCount = config.__retryCount || 0;
    
    // Check if we should retry
    if (config.__retryCount < MAX_RETRIES && shouldRetry(error)) {
      config.__retryCount += 1;
      
      const delay = getRetryDelay(config.__retryCount - 1);
      
      logger.warn(
        `Retrying request (attempt ${config.__retryCount}/${MAX_RETRIES})`,
        { url: config.url, delay },
        'API'
      );
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay));
      
      // Retry the request
      return apiClient(config);
    }
    
    // Handle common errors (after retries exhausted or non-retryable)
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;

      switch (status) {
        case 401:
          // Unauthorized - clear auth and redirect to login
          safeRemoveItem('auth_user');
          safeRemoveItem('auth_token');
          break;
        case 404:
          logger.error('Resource not found', { url: config.url }, 'API');
          break;
        case 500:
          logger.error('Server error', { message: data?.message || 'Internal server error' }, 'API');
          break;
        default:
          logger.error('API Error', { message: data?.message || error.message }, 'API');
      }
    } else if (error.request) {
      // Request made but no response received (network error)
      logger.error(
        'Network error: No response from server',
        { 
          url: config.url,
          retries: config.__retryCount,
          message: error.message 
        },
        'API'
      );
    } else {
      // Error setting up request
      logger.error('Request error', error, 'API');
    }

    return Promise.reject(error);
  }
);

export default apiClient;

