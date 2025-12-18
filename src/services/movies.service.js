/**
 * Movies Service
 * API calls related to movies
 * Now includes TMDB integration
 */

import apiClient from './api.service';
import { API_ENDPOINTS } from '../config/constants';
import tmdbService, { transformTMDBMovie } from './tmdb.service';
import logger from '../utils/logger';

export const moviesService = {
  /**
   * Get all movies
   * @returns {Promise} Array of movies
   */
  getAll: () => apiClient.get(API_ENDPOINTS.MOVIES),

  /**
   * Get movie by ID
   * @param {number|string} id - Movie ID
   * @returns {Promise} Movie object
   */
  getById: (id) => apiClient.get(`${API_ENDPOINTS.MOVIES}/${id}`),

  /**
   * Create new movie
   * @param {Object} movieData - Movie data
   * @returns {Promise} Created movie
   */
  create: (movieData) => apiClient.post(API_ENDPOINTS.MOVIES, movieData),

  /**
   * Update movie
   * @param {number|string} id - Movie ID
   * @param {Object} movieData - Updated movie data
   * @returns {Promise} Updated movie
   */
  update: (id, movieData) =>
    apiClient.put(`${API_ENDPOINTS.MOVIES}/${id}`, movieData),

  /**
   * Soft delete movie (mark as deleted)
   * @param {number|string} id - Movie ID
   * @returns {Promise}
   */
  softDelete: (id) =>
    apiClient.patch(`${API_ENDPOINTS.MOVIES}/${id}`, { isDeleted: true }),

  /**
   * Restore deleted movie
   * @param {number|string} id - Movie ID
   * @returns {Promise}
   */
  restore: (id) =>
    apiClient.patch(`${API_ENDPOINTS.MOVIES}/${id}`, { isDeleted: false }),

  /**
   * Search movies by title (local database)
   * @param {string} query - Search query
   * @returns {Promise} Filtered movies
   */
  searchByTitle: (query) =>
    apiClient.get(`${API_ENDPOINTS.MOVIES}/?title.spanish_like=${query}`),

  /**
   * Search movies in TMDB
   * @param {string} query - Search query
   * @param {number} page - Page number
   * @returns {Promise} TMDB search results
   */
  searchTMDB: async (query, page = 1) => {
    try {
      const response = await tmdbService.searchMovies(query, page);
      return response;
    } catch (error) {
      logger.error('TMDB search failed in moviesService', error, 'MoviesService');
      throw error;
    }
  },

  /**
   * Get movie from TMDB by ID
   * @param {number} tmdbId - TMDB movie ID
   * @returns {Promise} Movie data from TMDB
   */
  getFromTMDB: async (tmdbId) => {
    try {
      const movieData = await tmdbService.getMovieDetails(tmdbId);
      return transformTMDBMovie(movieData);
    } catch (error) {
      logger.error('Failed to get movie from TMDB', error, 'MoviesService');
      throw error;
    }
  },

  /**
   * Sync movie from TMDB to local database
   * @param {number} tmdbId - TMDB movie ID
   * @returns {Promise} Created movie in local DB
   */
  syncFromTMDB: async (tmdbId) => {
    try {
      // Get movie from TMDB
      const tmdbMovie = await tmdbService.getMovieDetails(tmdbId);
      
      // Transform to our format
      const movieData = transformTMDBMovie(tmdbMovie);

      // Save to local database
      const createdMovie = await apiClient.post(API_ENDPOINTS.MOVIES, movieData);
      
      logger.info('Movie synced from TMDB', { tmdbId, localId: createdMovie.data.id }, 'MoviesService');
      return createdMovie.data;
    } catch (error) {
      logger.error('Failed to sync movie from TMDB', error, 'MoviesService');
      throw error;
    }
  },

  /**
   * Get popular movies from TMDB
   * @param {number} page - Page number
   * @returns {Promise} Popular movies
   */
  getPopularFromTMDB: async (page = 1) => {
    try {
      return await tmdbService.getPopularMovies(page);
    } catch (error) {
      logger.error('Failed to get popular movies from TMDB', error, 'MoviesService');
      throw error;
    }
  },

  /**
   * Get now playing movies from TMDB (transformed format)
   * @param {number} page - Page number
   * @returns {Promise} Array of transformed movies
   */
  getNowPlayingFromTMDB: async (page = 1) => {
    try {
      const tmdbData = await tmdbService.getNowPlaying(page);
      const movies = [];

      // Transform each movie (basic transform, no full details to avoid rate limits)
      for (const tmdbMovie of tmdbData.results || []) {
        try {
          const transformed = transformTMDBMovie(tmdbMovie);
          movies.push(transformed);
        } catch (error) {
          logger.warn('Failed to transform movie', { tmdbId: tmdbMovie.id, error }, 'MoviesService');
        }
      }

      return movies;
    } catch (error) {
      logger.error('Failed to get now playing from TMDB', error, 'MoviesService');
      throw error;
    }
  },

  /**
   * Get similar movies from TMDB
   * @param {number} tmdbId - TMDB movie ID
   * @param {number} page - Page number (default: 1)
   * @returns {Promise} Array of transformed similar movies
   */
  getSimilarMoviesFromTMDB: async (tmdbId, page = 1) => {
    try {
      const tmdbData = await tmdbService.getSimilarMovies(tmdbId, page);
      const movies = [];

      // Transform each movie
      for (const tmdbMovie of tmdbData.results || []) {
        try {
          const transformed = transformTMDBMovie(tmdbMovie);
          movies.push(transformed);
        } catch (error) {
          logger.warn('Failed to transform similar movie', { tmdbId: tmdbMovie.id, error }, 'MoviesService');
        }
      }

      return movies;
    } catch (error) {
      logger.error('Failed to get similar movies from TMDB', error, 'MoviesService');
      throw error;
    }
  },

  /**
   * Get trending movies from TMDB
   * @param {string} timeWindow - 'day' or 'week' (default: 'day')
   * @param {number} page - Page number (default: 1)
   * @returns {Promise} Array of transformed trending movies
   */
  getTrendingFromTMDB: async (timeWindow = 'day', page = 1) => {
    try {
      const tmdbData = await tmdbService.getTrending(timeWindow, page);
      const movies = [];

      for (const tmdbMovie of tmdbData.results || []) {
        try {
          const transformed = transformTMDBMovie(tmdbMovie);
          movies.push(transformed);
        } catch (error) {
          logger.warn('Failed to transform trending movie', { tmdbId: tmdbMovie.id, error }, 'MoviesService');
        }
      }

      return movies;
    } catch (error) {
      logger.error('Failed to get trending movies from TMDB', error, 'MoviesService');
      throw error;
    }
  },

  /**
   * Get popular movies from TMDB (transformed format)
   * @param {number} page - Page number (default: 1)
   * @returns {Promise} Array of transformed popular movies
   */
  getPopularFromTMDB: async (page = 1) => {
    try {
      const tmdbData = await tmdbService.getPopularMovies(page);
      const movies = [];

      for (const tmdbMovie of tmdbData.results || []) {
        try {
          const transformed = transformTMDBMovie(tmdbMovie);
          movies.push(transformed);
        } catch (error) {
          logger.warn('Failed to transform popular movie', { tmdbId: tmdbMovie.id, error }, 'MoviesService');
        }
      }

      return movies;
    } catch (error) {
      logger.error('Failed to get popular movies from TMDB', error, 'MoviesService');
      throw error;
    }
  },

  /**
   * Get top rated movies from TMDB (transformed format)
   * @param {number} page - Page number (default: 1)
   * @returns {Promise} Array of transformed top rated movies
   */
  getTopRatedFromTMDB: async (page = 1) => {
    try {
      const tmdbData = await tmdbService.getTopRated(page);
      const movies = [];

      for (const tmdbMovie of tmdbData.results || []) {
        try {
          const transformed = transformTMDBMovie(tmdbMovie);
          movies.push(transformed);
        } catch (error) {
          logger.warn('Failed to transform top rated movie', { tmdbId: tmdbMovie.id, error }, 'MoviesService');
        }
      }

      return movies;
    } catch (error) {
      logger.error('Failed to get top rated movies from TMDB', error, 'MoviesService');
      throw error;
    }
  },

  /**
   * Get upcoming movies from TMDB (transformed format)
   * @param {number} page - Page number (default: 1)
   * @returns {Promise} Array of transformed upcoming movies
   */
  getUpcomingFromTMDB: async (page = 1) => {
    try {
      const tmdbData = await tmdbService.getUpcoming(page);
      const movies = [];

      for (const tmdbMovie of tmdbData.results || []) {
        try {
          const transformed = transformTMDBMovie(tmdbMovie);
          movies.push(transformed);
        } catch (error) {
          logger.warn('Failed to transform upcoming movie', { tmdbId: tmdbMovie.id, error }, 'MoviesService');
        }
      }

      return movies;
    } catch (error) {
      logger.error('Failed to get upcoming movies from TMDB', error, 'MoviesService');
      throw error;
    }
  },

  /**
   * Get recommended movies from TMDB
   * @param {number} tmdbId - TMDB movie ID
   * @param {number} page - Page number (default: 1)
   * @returns {Promise} Array of transformed recommended movies
   */
  getRecommendationsFromTMDB: async (tmdbId, page = 1) => {
    try {
      const tmdbData = await tmdbService.getRecommendations(tmdbId, page);
      const movies = [];

      for (const tmdbMovie of tmdbData.results || []) {
        try {
          const transformed = transformTMDBMovie(tmdbMovie);
          movies.push(transformed);
        } catch (error) {
          logger.warn('Failed to transform recommended movie', { tmdbId: tmdbMovie.id, error }, 'MoviesService');
        }
      }

      return movies;
    } catch (error) {
      logger.error('Failed to get recommendations from TMDB', error, 'MoviesService');
      throw error;
    }
  },

  /**
   * Discover movies with advanced filters
   * @param {Object} filters - Filter options (genre, year, rating, etc.)
   * @param {number} page - Page number (default: 1)
   * @returns {Promise} Array of transformed discovered movies
   */
  discoverMoviesFromTMDB: async (filters = {}, page = 1) => {
    try {
      const tmdbData = await tmdbService.discoverMovies(filters, page);
      const movies = [];

      for (const tmdbMovie of tmdbData.results || []) {
        try {
          const transformed = transformTMDBMovie(tmdbMovie);
          movies.push(transformed);
        } catch (error) {
          logger.warn('Failed to transform discovered movie', { tmdbId: tmdbMovie.id, error }, 'MoviesService');
        }
      }

      return movies;
    } catch (error) {
      logger.error('Failed to discover movies from TMDB', error, 'MoviesService');
      throw error;
    }
  },
};

