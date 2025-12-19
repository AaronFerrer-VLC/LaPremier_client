/**
 * React Query hooks for cinemas
 * Provides cached and optimized data fetching for cinemas
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cinemasService } from '../services/cinemas.service';
import { notifySuccess, notifyError } from '../utils/notifications';
import logger from '../utils/logger';

// Query keys
export const cinemaKeys = {
  all: ['cinemas'],
  lists: () => [...cinemaKeys.all, 'list'],
  list: (city) => [...cinemaKeys.lists(), { city }],
  details: () => [...cinemaKeys.all, 'detail'],
  detail: (id) => [...cinemaKeys.details(), id],
};

/**
 * Fetch all cinemas
 */
export const useCinemas = (options = {}) => {
  return useQuery({
    queryKey: cinemaKeys.lists(),
    queryFn: async () => {
      const response = await cinemasService.getAll();
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};

/**
 * Fetch cinemas by city
 */
export const useCinemasByCity = (city, options = {}) => {
  return useQuery({
    queryKey: cinemaKeys.list(city),
    queryFn: async () => {
      if (!city) {
        return [];
      }
      const response = await cinemasService.getByCity(city);
      return response.data.filter(c => !c.isDeleted);
    },
    enabled: !!city,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};

/**
 * Fetch cinema by ID
 */
export const useCinema = (cinemaId, options = {}) => {
  return useQuery({
    queryKey: cinemaKeys.detail(cinemaId),
    queryFn: async () => {
      if (!cinemaId || cinemaId === 'undefined') {
        throw new Error('Cinema ID is required');
      }
      const response = await cinemasService.getById(cinemaId);
      return response.data;
    },
    enabled: !!cinemaId && cinemaId !== 'undefined',
    staleTime: 10 * 60 * 1000, // 10 minutes (details change less frequently)
    ...options,
  });
};

/**
 * Create cinema mutation
 */
export const useCreateCinema = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (cinemaData) => {
      const response = await cinemasService.create(cinemaData);
      return response.data;
    },
    onSuccess: (data) => {
      // Invalidate cinemas lists
      queryClient.invalidateQueries({ queryKey: cinemaKeys.lists() });
      queryClient.invalidateQueries({ queryKey: cinemaKeys.list(data.address?.city) });
      notifySuccess('Cine creado correctamente');
      logger.info('Cinema created', { cinemaId: data.id || data._id }, 'useCinemas');
    },
    onError: (error) => {
      logger.error('Failed to create cinema', error, 'useCinemas');
      notifyError('Error al crear el cine');
    },
  });
};

/**
 * Update cinema mutation
 */
export const useUpdateCinema = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }) => {
      const response = await cinemasService.update(id, data);
      return response.data;
    },
    onSuccess: (data, variables) => {
      // Invalidate specific cinema and lists
      queryClient.invalidateQueries({ queryKey: cinemaKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: cinemaKeys.lists() });
      if (data.address?.city) {
        queryClient.invalidateQueries({ queryKey: cinemaKeys.list(data.address.city) });
      }
      notifySuccess('Cine actualizado correctamente');
      logger.info('Cinema updated', { cinemaId: variables.id }, 'useCinemas');
    },
    onError: (error) => {
      logger.error('Failed to update cinema', error, 'useCinemas');
      notifyError('Error al actualizar el cine');
    },
  });
};

/**
 * Soft delete cinema mutation (mark as deleted)
 */
export const useSoftDeleteCinema = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      const response = await cinemasService.softDelete(id);
      return response.data;
    },
    onSuccess: (data, id) => {
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: cinemaKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: cinemaKeys.lists() });
      logger.info('Cinema soft deleted', { cinemaId: id }, 'useCinemas');
    },
    onError: (error) => {
      logger.error('Failed to soft delete cinema', error, 'useCinemas');
      throw error; // Let caller handle notification
    },
  });
};

/**
 * Delete cinema mutation (hard delete - if exists)
 */
export const useDeleteCinema = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      const response = await cinemasService.softDelete(id); // Using softDelete as primary delete method
      return response.data;
    },
    onSuccess: (data, id) => {
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: cinemaKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: cinemaKeys.lists() });
      notifySuccess('Cine eliminado correctamente');
      logger.info('Cinema deleted', { cinemaId: id }, 'useCinemas');
    },
    onError: (error) => {
      logger.error('Failed to delete cinema', error, 'useCinemas');
      notifyError('Error al eliminar el cine');
    },
  });
};

