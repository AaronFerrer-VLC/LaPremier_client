/**
 * React Query hooks for movies
 * Provides cached and optimized data fetching for movies
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { moviesService } from '../services/movies.service';
import { notifySuccess, notifyError } from '../utils/notifications';
import logger from '../utils/logger';

// Query keys
export const movieKeys = {
  all: ['movies'],
  lists: () => [...movieKeys.all, 'list'],
  list: (filters) => [...movieKeys.lists(), { filters }],
  details: () => [...movieKeys.all, 'detail'],
  detail: (id) => [...movieKeys.details(), id],
  search: (query) => [...movieKeys.all, 'search', query],
  nowPlaying: (page) => [...movieKeys.all, 'nowPlaying', page],
  trending: (timeWindow, page) => [...movieKeys.all, 'trending', timeWindow, page],
  popular: (page) => [...movieKeys.all, 'popular', page],
  upcoming: (page) => [...movieKeys.all, 'upcoming', page],
};

/**
 * Fetch all movies
 */
export const useMovies = (options = {}) => {
  return useQuery({
    queryKey: movieKeys.lists(),
    queryFn: async () => {
      const response = await moviesService.getAll();
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};

/**
 * Fetch movie by ID (handles both TMDB and MongoDB)
 */
export const useMovie = (movieId, options = {}) => {
  const { enableTMDB = true, ...queryOptions } = options;
  const isTMDBId = movieId && /^\d+$/.test(String(movieId));
  
  return useQuery({
    queryKey: movieKeys.detail(movieId),
    queryFn: async () => {
      if (!movieId || movieId === 'undefined') {
        throw new Error('Movie ID is required');
      }
      
      // If it's a numeric ID (TMDB), try TMDB first if enabled
      if (isTMDBId && enableTMDB !== false) {
        try {
          const tmdbMovie = await moviesService.getFromTMDB(Number(movieId));
          logger.info('Movie loaded from TMDB', { movieId, tmdbId: Number(movieId) }, 'useMovie');
          return tmdbMovie;
        } catch (tmdbError) {
          logger.warn('Failed to get movie from TMDB, trying MongoDB', tmdbError, 'useMovie');
          // Fall through to MongoDB
        }
      }
      
      // Try MongoDB (either as primary source or fallback)
      const response = await moviesService.getById(movieId);
      logger.info('Movie loaded from MongoDB', { movieId }, 'useMovie');
      return response.data;
    },
    enabled: !!movieId && movieId !== 'undefined',
    staleTime: 10 * 60 * 1000, // 10 minutes (details change less frequently)
    ...queryOptions,
  });
};

/**
 * Search movies in TMDB
 */
export const useSearchMovies = (query, page = 1, options = {}) => {
  return useQuery({
    queryKey: movieKeys.search(query),
    queryFn: async () => {
      if (!query || query.trim() === '') {
        return { results: [], total_pages: 0, total_results: 0 };
      }
      return await moviesService.searchTMDB(query, page);
    },
    enabled: !!query && query.trim() !== '',
    staleTime: 2 * 60 * 1000, // 2 minutes (search results change frequently)
    ...options,
  });
};

/**
 * Fetch now playing movies from TMDB
 */
export const useNowPlayingMovies = (page = 1, options = {}) => {
  return useQuery({
    queryKey: movieKeys.nowPlaying(page),
    queryFn: async () => {
      return await moviesService.getNowPlayingFromTMDB(page);
    },
    staleTime: 30 * 60 * 1000, // 30 minutes (now playing changes daily)
    ...options,
  });
};

/**
 * Fetch trending movies from TMDB
 */
export const useTrendingMovies = (timeWindow = 'day', page = 1, options = {}) => {
  return useQuery({
    queryKey: movieKeys.trending(timeWindow, page),
    queryFn: async () => {
      return await moviesService.getTrendingFromTMDB(timeWindow, page);
    },
    staleTime: 60 * 60 * 1000, // 1 hour (trending updates hourly)
    ...options,
  });
};

/**
 * Fetch popular movies from TMDB
 */
export const usePopularMovies = (page = 1, options = {}) => {
  return useQuery({
    queryKey: movieKeys.popular(page),
    queryFn: async () => {
      return await moviesService.getPopularFromTMDB(page);
    },
    staleTime: 24 * 60 * 60 * 1000, // 24 hours (popular changes daily)
    ...options,
  });
};

/**
 * Fetch upcoming movies from TMDB
 */
export const useUpcomingMovies = (page = 1, options = {}) => {
  return useQuery({
    queryKey: movieKeys.upcoming(page),
    queryFn: async () => {
      return await moviesService.getUpcomingFromTMDB(page);
    },
    staleTime: 24 * 60 * 60 * 1000, // 24 hours (upcoming changes daily)
    ...options,
  });
};

/**
 * Create movie mutation
 */
export const useCreateMovie = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (movieData) => {
      const response = await moviesService.create(movieData);
      return response.data;
    },
    onSuccess: (data) => {
      // Invalidate movies list to refetch
      queryClient.invalidateQueries({ queryKey: movieKeys.lists() });
      notifySuccess('Película creada correctamente');
      logger.info('Movie created', { movieId: data.id || data._id }, 'useMovies');
    },
    onError: (error) => {
      logger.error('Failed to create movie', error, 'useMovies');
      notifyError('Error al crear la película');
    },
  });
};

/**
 * Update movie mutation
 */
export const useUpdateMovie = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }) => {
      const response = await moviesService.update(id, data);
      return response.data;
    },
    onSuccess: (data, variables) => {
      // Invalidate specific movie and list
      queryClient.invalidateQueries({ queryKey: movieKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: movieKeys.lists() });
      notifySuccess('Película actualizada correctamente');
      logger.info('Movie updated', { movieId: variables.id }, 'useMovies');
    },
    onError: (error) => {
      logger.error('Failed to update movie', error, 'useMovies');
      notifyError('Error al actualizar la película');
    },
  });
};

/**
 * Soft delete movie mutation (mark as deleted)
 */
export const useSoftDeleteMovie = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      const response = await moviesService.softDelete(id);
      return response.data;
    },
    onSuccess: (data, id) => {
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: movieKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: movieKeys.lists() });
      logger.info('Movie soft deleted', { movieId: id }, 'useMovies');
    },
    onError: (error) => {
      logger.error('Failed to soft delete movie', error, 'useMovies');
      throw error; // Let caller handle notification
    },
  });
};

/**
 * Delete movie mutation (hard delete - if exists)
 */
export const useDeleteMovie = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      const response = await moviesService.softDelete(id); // Using softDelete as primary delete method
      return response.data;
    },
    onSuccess: (data, id) => {
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: movieKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: movieKeys.lists() });
      notifySuccess('Película eliminada correctamente');
      logger.info('Movie deleted', { movieId: id }, 'useMovies');
    },
    onError: (error) => {
      logger.error('Failed to delete movie', error, 'useMovies');
      notifyError('Error al eliminar la película');
    },
  });
};

