import apiClient from './api.service';
import { API_ENDPOINTS } from '../config/constants';

export const favoritesService = {
  /**
   * Get user favorites/watchlist
   * @param {string} userId - User ID
   * @param {string} type - 'favorite' or 'watchlist' (optional)
   * @returns {Promise} Array of favorites
   */
  getUserFavorites: (userId, type = null) => {
    const params = new URLSearchParams({ userId });
    if (type) params.append('type', type);
    return apiClient.get(`${API_ENDPOINTS.FAVORITES}?${params.toString()}`);
  },

  /**
   * Add movie to favorites/watchlist
   * @param {string} userId - User ID
   * @param {string|number} movieId - Movie ID
   * @param {string} type - 'favorite' or 'watchlist'
   * @returns {Promise} Created favorite
   */
  addFavorite: (userId, movieId, type = 'favorite') => {
    return apiClient.post(API_ENDPOINTS.FAVORITES, { userId, movieId, type });
  },

  /**
   * Remove movie from favorites/watchlist
   * @param {string} userId - User ID
   * @param {string|number} movieId - Movie ID
   * @param {string} type - 'favorite' or 'watchlist' (optional)
   * @returns {Promise}
   */
  removeFavorite: (userId, movieId, type = null) => {
    const params = new URLSearchParams({ userId, movieId: movieId.toString() });
    if (type) params.append('type', type);
    return apiClient.delete(`${API_ENDPOINTS.FAVORITES}?${params.toString()}`);
  },

  /**
   * Check if movie is in favorites/watchlist
   * @param {string} userId - User ID
   * @param {string|number} movieId - Movie ID
   * @param {string} type - 'favorite' or 'watchlist' (optional)
   * @returns {Promise} { exists: boolean, favorite: object|null }
   */
  checkFavorite: (userId, movieId, type = null) => {
    const params = new URLSearchParams({ userId, movieId: movieId.toString() });
    if (type) params.append('type', type);
    return apiClient.get(`${API_ENDPOINTS.FAVORITES}/check?${params.toString()}`);
  },

  /**
   * Get favorite statistics
   * @param {string} userId - User ID
   * @returns {Promise} { favorites: number, watchlist: number, total: number }
   */
  getFavoriteStats: (userId) => {
    return apiClient.get(`${API_ENDPOINTS.FAVORITES}/stats?userId=${userId}`);
  }
};

