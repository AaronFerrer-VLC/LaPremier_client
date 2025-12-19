/**
 * Location Service
 * Handles geolocation and city detection
 */

import logger from '../utils/logger';
import { safeGetItem, safeSetItem } from '../utils/storage';

export const locationService = {
  /**
   * Get user's current location using browser geolocation API
   * @returns {Promise<{lat: number, lng: number}>} User coordinates
   */
  getCurrentPosition: () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          logger.error('Geolocation error', error, 'LocationService');
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000, // Cache for 1 minute
        }
      );
    });
  },

  /**
   * Reverse geocode coordinates to get city name
   * Uses OpenStreetMap Nominatim (free, no API key required)
   * @param {number} lat - Latitude
   * @param {number} lng - Longitude
   * @returns {Promise<string>} City name
   */
  getCityFromCoordinates: async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'LaPremiere/1.0', // Required by Nominatim
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to reverse geocode');
      }

      const data = await response.json();
      const city = data.address?.city || data.address?.town || data.address?.municipality || 'Desconocida';
      
      logger.info('City detected from coordinates', { city, lat, lng }, 'LocationService');
      return city;
    } catch (error) {
      logger.error('Failed to get city from coordinates', error, 'LocationService');
      throw error;
    }
  },

  /**
   * Get user's city (tries geolocation first, falls back to localStorage)
   * @returns {Promise<string>} City name
   */
  getUserCity: async () => {
    try {
      // Check localStorage first
      const savedCity = safeGetItem('userCity');
      if (savedCity) {
        logger.info('Using saved city from localStorage', { city: savedCity }, 'LocationService');
        return savedCity;
      }

      // Try geolocation
      const position = await locationService.getCurrentPosition();
      const city = await locationService.getCityFromCoordinates(position.lat, position.lng);
      
      // Save to localStorage securely
      safeSetItem('userCity', city);
      
      return city;
    } catch (error) {
      logger.warn('Could not detect city, using default', error, 'LocationService');
      // Return default city or ask user
      return 'Madrid'; // Default to Madrid
    }
  },

  /**
   * Set user's city manually
   * @param {string} city - City name
   */
  setUserCity: (city) => {
    if (typeof city === 'string' && city.trim()) {
      safeSetItem('userCity', city.trim());
      logger.info('User city set manually', { city }, 'LocationService');
    }
  },

  /**
   * Get saved city from localStorage
   * @returns {string|null} City name or null
   */
  getSavedCity: () => {
    return safeGetItem('userCity');
  },
};

export default locationService;

