/**
 * React Query Configuration
 * Centralized QueryClient setup with default options
 */

import { QueryClient } from '@tanstack/react-query';
import logger from '../utils/logger';

// Create QueryClient with optimized defaults
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache data for 5 minutes
      staleTime: 5 * 60 * 1000, // 5 minutes
      // Keep unused data in cache for 10 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      // Retry failed requests
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      // Refetch on window focus (good for keeping data fresh)
      refetchOnWindowFocus: true,
      // Don't refetch on mount if data is fresh
      refetchOnMount: true,
      // Refetch on reconnect
      refetchOnReconnect: true,
      // Error handling
      onError: (error) => {
        logger.error('Query error', error, 'ReactQuery');
      },
    },
    mutations: {
      // Retry mutations once
      retry: 1,
      // Error handling
      onError: (error) => {
        logger.error('Mutation error', error, 'ReactQuery');
      },
    },
  },
});

