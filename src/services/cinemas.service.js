/**
 * Cinemas Service
 * API calls related to cinemas
 */

import apiClient from './api.service';
import { API_ENDPOINTS } from '../config/constants';

export const cinemasService = {
  /**
   * Get all cinemas
   * @returns {Promise} Array of cinemas
   */
  getAll: () => apiClient.get(API_ENDPOINTS.CINEMAS),

  /**
   * Get cinema by ID
   * @param {number|string} id - Cinema ID
   * @returns {Promise} Cinema object
   */
  getById: (id) => apiClient.get(`${API_ENDPOINTS.CINEMAS}/${id}`),

  /**
   * Create new cinema
   * @param {Object} cinemaData - Cinema data
   * @returns {Promise} Created cinema
   */
  create: (cinemaData) => apiClient.post(API_ENDPOINTS.CINEMAS, cinemaData),

  /**
   * Update cinema
   * @param {number|string} id - Cinema ID
   * @param {Object} cinemaData - Updated cinema data
   * @returns {Promise} Updated cinema
   */
  update: (id, cinemaData) =>
    apiClient.put(`${API_ENDPOINTS.CINEMAS}/${id}`, cinemaData),

  /**
   * Soft delete cinema (mark as deleted)
   * @param {number|string} id - Cinema ID
   * @returns {Promise}
   */
  softDelete: (id) =>
    apiClient.patch(`${API_ENDPOINTS.CINEMAS}/${id}`, { isDeleted: true }),

  /**
   * Restore deleted cinema
   * @param {number|string} id - Cinema ID
   * @returns {Promise}
   */
  restore: (id) =>
    apiClient.patch(`${API_ENDPOINTS.CINEMAS}/${id}`, { isDeleted: false }),

  /**
   * Search cinemas by name
   * @param {string} query - Search query
   * @returns {Promise} Filtered cinemas
   */
  searchByName: (query) =>
    apiClient.get(`${API_ENDPOINTS.CINEMAS}/?name_like=${query}`),

  /**
   * Get cinemas by city
   * @param {string} city - City name
   * @returns {Promise} Filtered cinemas
   */
  getByCity: (city) =>
    apiClient.get(`${API_ENDPOINTS.CINEMAS}?city=${encodeURIComponent(city)}`),
};

