/**
 * Environment Variables Configuration
 * Validates and exports environment variables
 */

const requiredEnvVars = ['VITE_APP_API_URL'];
const optionalEnvVars = [
  // VITE_TMDB_API_KEY is no longer needed - API calls go through backend proxy
  'VITE_GOOGLE_PLACES_API_KEY', // Still optional, used for frontend maps if needed
  'VITE_FOURSQUARE_API_KEY', // Still optional, used for frontend maps if needed
];

const validateEnv = () => {
  const missing = requiredEnvVars.filter(
    (varName) => !import.meta.env[varName]
  );

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`
    );
  }
};

// Validate on import
validateEnv();

export const ENV = {
  API_URL: import.meta.env.VITE_APP_API_URL,
  // TMDB_API_KEY removed - all TMDB calls go through backend proxy
  GOOGLE_PLACES_API_KEY: import.meta.env.VITE_GOOGLE_PLACES_API_KEY,
  FOURSQUARE_API_KEY: import.meta.env.VITE_FOURSQUARE_API_KEY,
  NODE_ENV: import.meta.env.MODE || 'development',
  IS_DEVELOPMENT: import.meta.env.MODE === 'development',
  IS_PRODUCTION: import.meta.env.MODE === 'production',
  HAS_TMDB: true, // Always true now - backend handles TMDB API key
  HAS_GOOGLE_PLACES: !!import.meta.env.VITE_GOOGLE_PLACES_API_KEY,
  HAS_FOURSQUARE: !!import.meta.env.VITE_FOURSQUARE_API_KEY,
};

