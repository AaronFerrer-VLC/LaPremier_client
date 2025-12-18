/**
 * TMDB Service
 * Integration with The Movie Database API via Backend Proxy
 * All API calls go through backend to protect API keys
 * Documentation: https://developers.themoviedb.org/3
 */

import apiClient from './api.service';
import logger from '../utils/logger';

// TMDB Image URLs (still public, no API key needed)
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

/**
 * Get image URL from TMDB
 * @param {string} path - Image path from TMDB
 * @param {string} size - Image size (w200, w300, w500, original, etc.)
 * @returns {string} Full image URL
 */
export const getTMDBImageUrl = (path, size = 'w500') => {
  if (!path) return null;
  return `${TMDB_IMAGE_BASE_URL}/${size}${path}`;
};

/**
 * Get YouTube trailer URL
 * @param {string} key - YouTube video key
 * @returns {string} YouTube URL
 */
export const getYouTubeUrl = (key) => {
  if (!key) return null;
  return `https://www.youtube.com/watch?v=${key}`;
};

/**
 * Transform TMDB movie data to our application format
 * @param {Object} tmdbMovie - Movie data from TMDB
 * @returns {Object} Formatted movie data
 */
export const transformTMDBMovie = (tmdbMovie) => {
  // Get director from crew
  const directorObj = tmdbMovie.credits?.crew?.find(
    (person) => person.job === 'Director'
  );
  const director = directorObj?.name || '';
  const directorId = directorObj?.id || null;

  // Get main trailer
  const trailer = tmdbMovie.videos?.results?.find(
    (video) => video.type === 'Trailer' && video.site === 'YouTube'
  )?.key || '';

  // Get top 5 cast members with IDs
  const casting = (tmdbMovie.credits?.cast || [])
    .slice(0, 5)
    .map((actor) => ({
      id: actor.id,
      name: actor.name,
      photo: getTMDBImageUrl(actor.profile_path, 'w200'),
    }));

  // Get genres
  const gender = (tmdbMovie.genres || []).map((genre) => genre.name);

  // Get production countries
  const country = tmdbMovie.production_countries?.[0]?.name || 'Desconocido';

  // Get release year for calification
  const calification = tmdbMovie.release_date
    ? tmdbMovie.release_date.split('-')[0]
    : '';

  return {
    // TMDB ID for reference
    tmdbId: tmdbMovie.id,
    
    // Title
    title: {
      original: tmdbMovie.original_title || '',
      spanish: tmdbMovie.title || tmdbMovie.original_title || '',
    },

    // Images - Use higher quality poster, fallback to backdrop if no poster
    poster: getTMDBImageUrl(tmdbMovie.poster_path, 'w500') || 
            getTMDBImageUrl(tmdbMovie.backdrop_path, 'w500') || 
            null,
    backdrop: getTMDBImageUrl(tmdbMovie.backdrop_path, 'original') || 
               getTMDBImageUrl(tmdbMovie.poster_path, 'original') || 
               null,

    // Basic info
    country,
    language: tmdbMovie.original_language || 'en',
    duration: tmdbMovie.runtime || 0,
    gender,
    calification,
    released: !!tmdbMovie.release_date,
    date: tmdbMovie.release_date || '',

    // Details
    director,
    directorId,
    trailer: trailer ? getYouTubeUrl(trailer) : '',
    description: tmdbMovie.overview || '',
    casting,
    
    // Collection (saga)
    collection: tmdbMovie.belongs_to_collection || null,

    // Additional TMDB data
    rating: tmdbMovie.vote_average || 0,
    voteCount: tmdbMovie.vote_count || 0,
    popularity: tmdbMovie.popularity || 0,
    imdbId: tmdbMovie.imdb_id || null,
    
    // Watch providers (streaming platforms)
    watchProviders: tmdbMovie.watchProviders || {},
  };
};

export const tmdbService = {
  /**
   * Search movies
   * @param {string} query - Search query
   * @param {number} page - Page number (default: 1)
   * @returns {Promise} Search results
   */
  searchMovies: async (query, page = 1) => {
    try {
      if (!query || query.trim().length < 2) {
        return { results: [], total_results: 0, page: 1, total_pages: 0 };
      }

      const response = await apiClient.get('/api/external/tmdb/movies/search', {
        params: {
          query: query.trim(),
          page,
        },
      });

      logger.info('TMDB search successful', { query, results: response.data.data?.results?.length || 0 }, 'TMDB');
      return response.data.data || response.data;
    } catch (error) {
      logger.error('TMDB search failed', error, 'TMDB');
      
      // Provide more helpful error messages
      if (error.response) {
        const errorMessage = error.response.data?.error?.message || error.message;
        throw new Error(`Error de TMDB: ${errorMessage}`);
      } else if (error.request) {
        throw new Error('No se pudo conectar con el servidor. Verifica tu conexión a internet.');
      } else {
        throw error;
      }
    }
  },

  /**
   * Get movie details by TMDB ID
   * @param {number} movieId - TMDB movie ID
   * @returns {Promise} Movie details
   */
  getMovieDetails: async (movieId) => {
    try {
      // Backend proxy includes credits, videos, and watch/providers in append_to_response
      const response = await apiClient.get(`/api/external/tmdb/movies/${movieId}`, {
        params: {
          append_to_response: 'credits,videos,watch/providers',
        },
      });

      const movieData = response.data.data || response.data;
      
      // Ensure watchProviders is in the right format
      if (movieData['watch/providers']) {
        movieData.watchProviders = movieData['watch/providers'].results || {};
        delete movieData['watch/providers'];
      }

      logger.info('TMDB movie details fetched', { movieId }, 'TMDB');
      return movieData;
    } catch (error) {
      logger.error('Failed to fetch TMDB movie details', error, 'TMDB');
      throw error;
    }
  },

  /**
   * Get popular movies
   * @param {number} page - Page number (default: 1)
   * @returns {Promise} Popular movies
   */
  getPopularMovies: async (page = 1) => {
    try {
      const response = await apiClient.get('/api/external/tmdb/movies/popular', {
        params: { page },
      });

      logger.info('TMDB popular movies fetched', { count: response.data.data?.results?.length || 0 }, 'TMDB');
      return response.data.data || response.data;
    } catch (error) {
      logger.error('Failed to fetch popular movies', error, 'TMDB');
      throw error;
    }
  },

  /**
   * Get now playing movies
   * @param {number} page - Page number (default: 1)
   * @returns {Promise} Now playing movies
   */
  getNowPlaying: async (page = 1) => {
    try {
      const response = await apiClient.get('/api/external/tmdb/movies/now-playing', {
        params: { page },
      });

      logger.info('TMDB now playing fetched', { count: response.data.data?.results?.length || 0 }, 'TMDB');
      return response.data.data || response.data;
    } catch (error) {
      logger.error('Failed to fetch now playing movies', error, 'TMDB');
      throw error;
    }
  },

  /**
   * Get upcoming movies
   * @param {number} page - Page number (default: 1)
   * @returns {Promise} Upcoming movies
   */
  getUpcoming: async (page = 1) => {
    try {
      const response = await apiClient.get('/api/external/tmdb/movies/upcoming', {
        params: { page },
      });

      logger.info('TMDB upcoming movies fetched', { count: response.data.data?.results?.length || 0 }, 'TMDB');
      return response.data.data || response.data;
    } catch (error) {
      logger.error('Failed to fetch upcoming movies', error, 'TMDB');
      throw error;
    }
  },

  /**
   * Get top rated movies
   * @param {number} page - Page number (default: 1)
   * @returns {Promise} Top rated movies
   */
  getTopRated: async (page = 1) => {
    try {
      const response = await apiClient.get('/api/external/tmdb/movies/top-rated', {
        params: { page },
      });

      logger.info('TMDB top rated fetched', { count: response.data.data?.results?.length || 0 }, 'TMDB');
      return response.data.data || response.data;
    } catch (error) {
      logger.error('Failed to fetch top rated movies', error, 'TMDB');
      throw error;
    }
  },

  /**
   * Get similar movies from TMDB
   * @param {number} movieId - TMDB movie ID
   * @param {number} page - Page number (default: 1)
   * @returns {Promise} Similar movies
   */
  getSimilarMovies: async (movieId, page = 1) => {
    try {
      const response = await apiClient.get(`/api/external/tmdb/movies/${movieId}/similar`, {
        params: { page },
      });

      logger.info('TMDB similar movies fetched', { movieId, count: response.data.data?.results?.length || 0 }, 'TMDB');
      return response.data.data || response.data;
    } catch (error) {
      logger.error('Failed to fetch similar movies', error, 'TMDB');
      throw error;
    }
  },

  /**
   * Get watch providers (streaming platforms) for a movie
   * @param {number} movieId - TMDB movie ID
   * @param {string} region - Region code (default: 'ES')
   * @returns {Promise} Watch providers data
   */
  getWatchProviders: async (movieId, region = 'ES') => {
    try {
      // Watch providers are included in getMovieDetails via append_to_response
      // This method is kept for backward compatibility but uses getMovieDetails
      const movieData = await tmdbService.getMovieDetails(movieId);
      
      // Get providers for the specified region
      const providers = movieData.watchProviders?.[region] || {};
      
      logger.info('TMDB watch providers fetched', { movieId, region, hasProviders: !!providers.flatrate }, 'TMDB');
      return {
        flatrate: providers.flatrate || [], // Subscription services (Netflix, HBO, etc.)
        rent: providers.rent || [], // Rent services
        buy: providers.buy || [], // Buy services
        ads: providers.ads || [], // Free with ads
      };
    } catch (error) {
      logger.error('Failed to fetch watch providers', error, 'TMDB');
      throw error;
    }
  },

  /**
   * Get movie by TMDB ID and transform to our format
   * @param {number} tmdbId - TMDB movie ID
   * @returns {Promise} Transformed movie data
   */
  getMovieAndTransform: async (tmdbId) => {
    try {
      const movieData = await tmdbService.getMovieDetails(tmdbId);
      return transformTMDBMovie(movieData);
    } catch (error) {
      logger.error('Failed to get and transform TMDB movie', error, 'TMDB');
      throw error;
    }
  },

  /**
   * Get trending movies (day or week)
   * @param {string} timeWindow - 'day' or 'week' (default: 'day')
   * @param {number} page - Page number (default: 1)
   * @returns {Promise} Trending movies
   */
  getTrending: async (timeWindow = 'day', page = 1) => {
    try {
      const response = await apiClient.get('/api/external/tmdb/movies/trending', {
        params: { page, time_window: timeWindow },
      });

      logger.info('TMDB trending movies fetched', { timeWindow, count: response.data.data?.results?.length || 0 }, 'TMDB');
      return response.data.data || response.data;
    } catch (error) {
      logger.error('Failed to fetch trending movies', error, 'TMDB');
      throw error;
    }
  },

  /**
   * Get recommended movies for a specific movie
   * @param {number} movieId - TMDB movie ID
   * @param {number} page - Page number (default: 1)
   * @returns {Promise} Recommended movies
   */
  getRecommendations: async (movieId, page = 1) => {
    try {
      const response = await apiClient.get(`/api/external/tmdb/movies/${movieId}/recommendations`, {
        params: { page },
      });

      logger.info('TMDB recommendations fetched', { movieId, count: response.data.data?.results?.length || 0 }, 'TMDB');
      return response.data.data || response.data;
    } catch (error) {
      logger.error('Failed to fetch recommendations', error, 'TMDB');
      throw error;
    }
  },

  /**
   * Discover movies with advanced filters
   * @param {Object} filters - Filter options
   * @param {number} page - Page number (default: 1)
   * @returns {Promise} Discovered movies
   */
  discoverMovies: async (filters = {}, page = 1) => {
    try {
      const params = {
        page,
        sort_by: filters.sortBy || 'popularity.desc',
        ...(filters.genre && { genre: filters.genre }),
        ...(filters.year && { year: filters.year }),
        ...(filters['vote_average.gte'] && { 'vote_average.gte': filters['vote_average.gte'] }),
      };

      // Remove undefined values
      Object.keys(params).forEach(key => params[key] === undefined && delete params[key]);

      const response = await apiClient.get('/api/external/tmdb/discover/movies', { params });

      logger.info('TMDB discover movies fetched', { filters, count: response.data.data?.results?.length || 0 }, 'TMDB');
      return response.data.data || response.data;
    } catch (error) {
      logger.error('Failed to discover movies', error, 'TMDB');
      throw error;
    }
  },

  /**
   * Get movie genres list
   * @returns {Promise} List of genres
   */
  getGenres: async () => {
    try {
      const response = await apiClient.get('/api/external/tmdb/genres');

      logger.info('TMDB genres fetched', { count: response.data.data?.genres?.length || 0 }, 'TMDB');
      return response.data.data?.genres || response.data.genres || [];
    } catch (error) {
      logger.error('Failed to fetch genres', error, 'TMDB');
      throw error;
    }
  },

  /**
   * Get person details (actor/director)
   * @param {number} personId - TMDB person ID
   * @returns {Promise} Person details
   */
  getPersonDetails: async (personId) => {
    try {
      // Note: Person details endpoint not yet implemented in backend proxy
      // For now, this will fail. Can be added to backend if needed.
      throw new Error('Person details endpoint not available through proxy. Please use Wikipedia links instead.');
    } catch (error) {
      logger.error('Failed to fetch person details', error, 'TMDB');
      throw error;
    }
  },

  /**
   * Get movie collection (saga)
   * @param {number} collectionId - TMDB collection ID
   * @returns {Promise} Collection details
   */
  getCollection: async (collectionId) => {
    try {
      // Note: Collection endpoint not yet implemented in backend proxy
      // Collections are included in movie details via belongs_to_collection
      // This method is kept for backward compatibility
      throw new Error('Collection endpoint not available through proxy. Collection data is included in movie details.');
    } catch (error) {
      logger.error('Failed to fetch collection', error, 'TMDB');
      throw error;
    }
  },
};

export default tmdbService;

