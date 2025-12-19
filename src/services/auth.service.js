/**
 * Authentication Service
 * Handles login, logout, and token management
 */

import apiClient from './api.service';
import logger from '../utils/logger';
import { safeGetItem, safeSetItem, safeRemoveItem } from '../utils/storage';

export const authService = {
  /**
   * Login user
   * @param {string} username - Username
   * @param {string} password - Password
   * @returns {Promise} User data and token
   */
  async login(username, password) {
    try {
      // Sanitize inputs
      const sanitizedUsername = typeof username === 'string' ? username.trim() : '';
      const sanitizedPassword = typeof password === 'string' ? password : '';
      
      if (!sanitizedUsername || !sanitizedPassword) {
        throw new Error('Username and password are required');
      }

      const response = await apiClient.post('/api/auth/login', {
        username: sanitizedUsername,
        password: sanitizedPassword
      });

      if (response.data.success && response.data.data.token) {
        // Store token securely
        safeSetItem('auth_token', response.data.data.token);
        
        // Store user data securely
        safeSetItem('auth_user', response.data.data.user);

        logger.info('User logged in successfully', { username: sanitizedUsername }, 'AuthService');
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
      // Sanitize inputs
      const sanitizedUsername = typeof username === 'string' ? username.trim() : '';
      const sanitizedPassword = typeof password === 'string' ? password : '';
      const sanitizedRole = typeof role === 'string' ? role.trim() : 'user';
      
      if (!sanitizedUsername || !sanitizedPassword) {
        throw new Error('Username and password are required');
      }

      // Validate role
      const validRoles = ['user', 'admin'];
      const finalRole = validRoles.includes(sanitizedRole) ? sanitizedRole : 'user';

      const response = await apiClient.post('/api/auth/register', {
        username: sanitizedUsername,
        password: sanitizedPassword,
        role: finalRole
      });

      if (response.data.success && response.data.data.token) {
        // Store token securely
        safeSetItem('auth_token', response.data.data.token);
        
        // Store user data securely
        safeSetItem('auth_user', response.data.data.user);

        logger.info('User registered successfully', { username: sanitizedUsername }, 'AuthService');
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
    safeRemoveItem('auth_token');
    safeRemoveItem('auth_user');
    logger.info('User logged out', {}, 'AuthService');
  },

  /**
   * Check if user is authenticated
   * @returns {boolean}
   */
  isAuthenticated() {
    const token = safeGetItem('auth_token');
    return !!token;
  },

  /**
   * Get stored token
   * @returns {string|null}
   */
  getToken() {
    return safeGetItem('auth_token');
  }
};

export default authService;

