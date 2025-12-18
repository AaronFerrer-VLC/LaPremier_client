/**
 * Application Constants
 * Centralized configuration and constants
 */

export const API_ENDPOINTS = {
  MOVIES: '/movies',
  CINEMAS: '/cinemas',
  REVIEWS: '/reviews',
  FAVORITES: '/favorites',
  HEALTH: '/health',
};

export const ROUTES = {
  HOME: '/',
  CINEMAS: '/cines',
  CINEMA_DETAILS: (id) => `/cines/detalles/${id}`,
  NEW_CINEMA: '/cines/crear',
  EDIT_CINEMA: (id) => `/cines/editar/${id}`,
  DELETED_CINEMAS: '/cines/eliminados',
  MOVIES: '/peliculas',
  MOVIE_DETAILS: (id) => `/peliculas/detalles/${id}`,
  NEW_MOVIE: '/peliculas/crear',
  EDIT_MOVIE: (id) => `/peliculas/editar/${id}`,
  DELETED_MOVIES: '/peliculas/eliminados',
  REVIEW_MOVIE: (id) => `/peliculas/reseña/${id}`,
  STATS: '/datos',
  FAVORITES: '/favoritos',
  WATCHLIST: '/ver-mas-tarde',
  COMPARE: '/comparar',
};

export const STORAGE_KEYS = {
  AUTH_USER: 'lapremier_auth_user',
  AUTH_TOKEN: 'lapremier_auth_token',
};

// AUTH_CREDENTIALS removed - Authentication now handled by backend JWT
// Old hardcoded credentials were a security risk and are no longer used

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
};

