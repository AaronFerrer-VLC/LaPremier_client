/**
 * Custom Hook for API Calls
 * Simplifies API calls with loading and error states
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { logError, formatErrorMessage } from '../utils/errorHandler';

/**
 * Custom hook for API calls
 * @param {Function} apiCall - Async function that makes the API call
 * @param {Array} dependencies - Dependencies array for useEffect
 * @param {boolean} immediate - Whether to call immediately on mount
 * @returns {Object} { data, loading, error, refetch }
 */
export const useApi = (apiCall, dependencies = [], immediate = true) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState(null);
  
  // Use ref to store the latest apiCall function without causing re-renders
  const apiCallRef = useRef(apiCall);
  
  // Update ref when apiCall changes
  useEffect(() => {
    apiCallRef.current = apiCall;
  }, [apiCall]);

  const execute = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiCallRef.current();
      setData(response.data);
      return response.data;
    } catch (err) {
      const errorMessage = formatErrorMessage(err);
      logError(err, 'useApi');
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []); // No dependencies - we use ref for apiCall

  useEffect(() => {
    if (immediate) {
      execute();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [execute, immediate, ...dependencies]);

  const refetch = useCallback(() => {
    return execute();
  }, [execute]);

  return { data, loading, error, refetch };
};

