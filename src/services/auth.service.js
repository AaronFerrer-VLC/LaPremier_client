/**
 * Authentication Service
 * Handles login, logout, and token management
 */

import apiClient from './api.service';
import { STORAGE_KEYS } from '../config/constants';
import logger from '../utils/logger';

export const authService = {
  /**
   * Login user
   * @param {string} username - Username
   * @param {string} password - Password
   * @returns {Promise} User data and token
   */
  async login(username, password) {
    try {
      const response = await apiClient.post('/api/auth/login', {
        username,
        password
      });

      if (response.data.success && response.data.data.token) {
        // Store token
        localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, response.data.data.token);
        
        // Store user data
        localStorage.setItem(
          STORAGE_KEYS.AUTH_USER,
          JSON.stringify(response.data.data.user)
        );

        logger.info('User logged in successfully', { username }, 'AuthService');
        return response.data.data;
      }

      throw new Error('Invalid response from server');
    } catch (error) {
      logger.error('Login failed', error, 'AuthService');
      throw error;
    }
  },

  /**
   * Register new user
   * @param {string} username - Username
   * @param {string} password - Password
   * @param {string} role - User role (default: 'user')
   * @returns {Promise} User data and token
   */
  async register(username, password, role = 'user') {
    try {
      const response = await apiClient.post('/api/auth/register', {
        username,
        password,
        role
      });

      if (response.data.success && response.data.data.token) {
        // Store token
        localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, response.data.data.token);
        
        // Store user data
        localStorage.setItem(
          STORAGE_KEYS.AUTH_USER,
          JSON.stringify(response.data.data.user)
        );

        logger.info('User registered successfully', { username }, 'AuthService');
        return response.data.data;
      }

      throw new Error('Invalid response from server');
    } catch (error) {
      logger.error('Registration failed', error, 'AuthService');
      throw error;
    }
  },

  /**
   * Get current user info
   * @returns {Promise} User data
   */
  async getCurrentUser() {
    try {
      const response = await apiClient.get('/api/auth/me');
      return response.data.data.user;
    } catch (error) {
      logger.error('Failed to get current user', error, 'AuthService');
      throw error;
    }
  },

  /**
   * Logout user
   */
  logout() {
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
    logger.info('User logged out', {}, 'AuthService');
  },

  /**
   * Check if user is authenticated
   * @returns {boolean}
   */
  isAuthenticated() {
    const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    return !!token;
  },

  /**
   * Get stored token
   * @returns {string|null}
   */
  getToken() {
    return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  }
};

export default authService;

