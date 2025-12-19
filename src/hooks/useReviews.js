/**
 * React Query hooks for reviews
 * Provides cached and optimized data fetching for reviews
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reviewsService } from '../services/reviews.service';
import { notifySuccess, notifyError } from '../utils/notifications';
import logger from '../utils/logger';

// Query keys
export const reviewKeys = {
  all: ['reviews'],
  lists: () => [...reviewKeys.all, 'list'],
  list: (movieId) => [...reviewKeys.lists(), movieId],
  details: () => [...reviewKeys.all, 'detail'],
  detail: (id) => [...reviewKeys.details(), id],
};

/**
 * Fetch reviews for a movie
 */
export const useReviews = (movieId, options = {}) => {
  return useQuery({
    queryKey: reviewKeys.list(movieId),
    queryFn: async () => {
      if (!movieId) {
        return [];
      }
      const response = await reviewsService.getByMovieId(movieId);
      return response.data || [];
    },
    enabled: !!movieId,
    staleTime: 2 * 60 * 1000, // 2 minutes (reviews change frequently)
    ...options,
  });
};

/**
 * Create review mutation
 */
export const useCreateReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reviewData) => {
      const response = await reviewsService.create(reviewData);
      return response.data;
    },
    onSuccess: (data) => {
      // Invalidate reviews list for the movie
      queryClient.invalidateQueries({ queryKey: reviewKeys.list(data.movieId) });
      notifySuccess('Reseña creada correctamente');
      logger.info('Review created', { reviewId: data.id || data._id }, 'useReviews');
    },
    onError: (error) => {
      logger.error('Failed to create review', error, 'useReviews');
      notifyError('Error al crear la reseña');
    },
  });
};

/**
 * Update review mutation
 */
export const useUpdateReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }) => {
      const response = await reviewsService.update(id, data);
      return response.data;
    },
    onSuccess: (data, variables) => {
      // Invalidate reviews list for the movie
      queryClient.invalidateQueries({ queryKey: reviewKeys.list(data.movieId) });
      queryClient.invalidateQueries({ queryKey: reviewKeys.detail(variables.id) });
      notifySuccess('Reseña actualizada correctamente');
      logger.info('Review updated', { reviewId: variables.id }, 'useReviews');
    },
    onError: (error) => {
      logger.error('Failed to update review', error, 'useReviews');
      notifyError('Error al actualizar la reseña');
    },
  });
};

/**
 * Delete review mutation
 */
export const useDeleteReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, movieId }) => {
      const response = await reviewsService.delete(id);
      return { ...response.data, movieId };
    },
    onSuccess: (data) => {
      // Invalidate reviews list for the movie
      queryClient.invalidateQueries({ queryKey: reviewKeys.list(data.movieId) });
      queryClient.invalidateQueries({ queryKey: reviewKeys.detail(data.id) });
      notifySuccess('Reseña eliminada correctamente');
      logger.info('Review deleted', { reviewId: data.id }, 'useReviews');
    },
    onError: (error) => {
      logger.error('Failed to delete review', error, 'useReviews');
      notifyError('Error al eliminar la reseña');
    },
  });
};

