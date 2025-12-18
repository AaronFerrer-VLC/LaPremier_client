import apiClient from './api.service';
import { API_ENDPOINTS } from '../config/constants';

export const reviewsService = {
  /**
   * Get all reviews
   * @returns {Promise} Array of reviews
   */
  getAll: () => apiClient.get(API_ENDPOINTS.REVIEWS),

  /**
   * Get review by ID
   * @param {number|string} id - Review ID
   * @returns {Promise} Review object
   */
  getById: (id) => apiClient.get(`${API_ENDPOINTS.REVIEWS}/${id}`),

  /**
   * Get reviews by movie ID
   * @param {number|string} movieId - Movie ID
   * @returns {Promise} Array of reviews
   */
  getByMovieId: (movieId) =>
    apiClient.get(`${API_ENDPOINTS.REVIEWS}?movieId=${movieId}`),

  /**
   * Create new review
   * @param {Object} reviewData - Review data
   * @returns {Promise} Created review
   */
  create: (reviewData) => apiClient.post(API_ENDPOINTS.REVIEWS, reviewData),

  /**
   * Update review
   * @param {number|string} id - Review ID
   * @param {Object} reviewData - Updated review data
   * @returns {Promise} Updated review
   */
  update: (id, reviewData) =>
    apiClient.put(`${API_ENDPOINTS.REVIEWS}/${id}`, reviewData),

  /**
   * Delete review
   * @param {number|string} id - Review ID
   * @returns {Promise}
   */
  delete: (id) => apiClient.delete(`${API_ENDPOINTS.REVIEWS}/${id}`),
};

