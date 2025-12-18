/**
 * Format error message for display
 * @param {Error|Object} error - Error object
 * @returns {string} Formatted error message
 */
export const formatErrorMessage = (error) => {
  if (!error) return 'Ha ocurrido un error desconocido';

  // Axios error
  if (error.response) {
    const { status, data } = error.response;
    if (data?.message) return data.message;
    if (status === 404) return 'Recurso no encontrado';
    if (status === 401) return 'No autorizado. Por favor, inicia sesión';
    if (status === 403) return 'Acceso denegado';
    if (status >= 500) return 'Error del servidor. Por favor, intenta más tarde';
    return `Error ${status}: ${data?.error || 'Error desconocido'}`;
  }

  // Network error
  if (error.request) {
    return 'Error de conexión. Verifica tu conexión a internet';
  }

  // Generic error
  return error.message || 'Ha ocurrido un error inesperado';
};

/**
 * Log error with context
 * @param {Error|Object} error - Error object
 * @param {string} context - Context where error occurred
 */
export const logError = (error, context = '') => {
  const message = formatErrorMessage(error);
  // Import logger dynamically to avoid circular dependencies
  import('./logger').then(({ default: logger }) => {
    logger.error(message, error, context);
  });
};

