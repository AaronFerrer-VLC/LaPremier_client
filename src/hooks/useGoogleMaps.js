import { useJsApiLoader } from '@react-google-maps/api';
import { useEffect } from 'react';
import { GOOGLE_MAPS_LIBRARIES } from '../config/googleMaps';
import logger from '../utils/logger';

/**
 * Shared hook for loading Google Maps API
 * This ensures the API is only loaded once across all components
 * Always uses the same library set to prevent multiple script loads
 * 
 * Note: DirectionsService is part of the core API and doesn't require a library
 */
export const useGoogleMaps = () => {
  // API key must come from environment variables - never hardcode!
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  
  if (!apiKey) {
    logger.warn('Google Maps API Key not configured. Set VITE_GOOGLE_MAPS_API_KEY in .env file', {}, 'useGoogleMaps');
  }
  
  // Log API key status (without exposing the full key)
  useEffect(() => {
    if (apiKey) {
      const maskedKey = apiKey.length > 10 
        ? `${apiKey.substring(0, 10)}...${apiKey.substring(apiKey.length - 4)}`
        : '***';
      logger.info('Google Maps API Key loaded', { key: maskedKey }, 'useGoogleMaps');
    } else {
      logger.warn('Google Maps API Key not found, using fallback', {}, 'useGoogleMaps');
    }
  }, [apiKey]);

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: apiKey,
    libraries: GOOGLE_MAPS_LIBRARIES, // Always use the same constant reference
    version: 'weekly'
  });

  // Log load errors
  useEffect(() => {
    if (loadError) {
      logger.error('Google Maps script failed to load', { 
        error: loadError.message || loadError,
        apiKeyPresent: !!apiKey 
      }, 'useGoogleMaps');
    }
  }, [loadError, apiKey]);

  return { isLoaded, loadError };
};

export default useGoogleMaps;

