/**
 * Google Maps Configuration
 * Centralized configuration for Google Maps libraries
 * This ensures all components use the same library references
 * 
 * Available libraries in Google Maps JavaScript API:
 * - places: Places API
 * - geocoding: Geocoding API
 * - drawing: Drawing tools
 * - geometry: Geometry library
 * - visualization: Visualization library
 * 
 * Note: DirectionsService is part of the core API and doesn't require a library
 */

// Libraries for most use cases
// DirectionsService doesn't need a library - it's part of the core API
export const GOOGLE_MAPS_LIBRARIES = Object.freeze(['places', 'geocoding']);

// Alias for consistency
export const GOOGLE_MAPS_LIBRARIES_BASIC = GOOGLE_MAPS_LIBRARIES;
export const GOOGLE_MAPS_LIBRARIES_FULL = GOOGLE_MAPS_LIBRARIES;

