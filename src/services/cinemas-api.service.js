/**
 * Cinemas API Service
 * Integration with external APIs to fetch cinema data via backend
 * This avoids CORS issues by calling through our backend server
 */

import apiClient from './api.service';
import logger from '../utils/logger';

export const cinemasAPIService = {
  /**
   * Search cinemas in a city using available APIs via backend
   * This avoids CORS issues by calling through our backend
   * Backend tries: Google Places > Foursquare > OpenStreetMap
   * @param {string} city - City name
   * @param {number} lat - Latitude (optional, for better accuracy)
   * @param {number} lng - Longitude (optional, for better accuracy)
   * @returns {Promise<Array>} Array of cinemas
   */
  searchCinemas: async (city, lat = null, lng = null) => {
    try {
      const params = new URLSearchParams({ city });
      if (lat && lng) {
        params.append('lat', lat);
        params.append('lng', lng);
      }
      
      const response = await apiClient.get(`/api/external/cinemas/search?${params.toString()}`);
      logger.info('Cinemas fetched from external API', { 
        count: response.data.data?.length || 0, 
        source: response.data.source,
        city 
      }, 'CinemasAPI');
      
      return response.data.data || [];
    } catch (error) {
      logger.error('Failed to search cinemas via backend', error, 'CinemasAPI');
      throw error;
    }
  },
};

export default cinemasAPIService;
