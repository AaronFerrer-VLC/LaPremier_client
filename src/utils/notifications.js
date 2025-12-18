/**
 * Notifications Utility
 * Centralized notification system using react-toastify
 */

import { toast } from 'react-toastify';
import logger from './logger';

/**
 * Show success notification
 * @param {string} message - Success message
 */
export const notifySuccess = (message) => {
  toast.success(message, {
    position: 'top-right',
    autoClose: 3000,
  });
  logger.info(`Success: ${message}`, null, 'Notifications');
};

/**
 * Show error notification
 * @param {string} message - Error message
 */
export const notifyError = (message) => {
  toast.error(message, {
    position: 'top-right',
    autoClose: 5000,
  });
  logger.error(`Error notification: ${message}`, null, 'Notifications');
};

/**
 * Show warning notification
 * @param {string} message - Warning message
 */
export const notifyWarning = (message) => {
  toast.warning(message, {
    position: 'top-right',
    autoClose: 4000,
  });
  logger.warn(`Warning: ${message}`, null, 'Notifications');
};

/**
 * Show info notification
 * @param {string} message - Info message
 */
export const notifyInfo = (message) => {
  toast.info(message, {
    position: 'top-right',
    autoClose: 3000,
  });
  logger.info(`Info: ${message}`, null, 'Notifications');
};

/**
 * Show promise notification (for async operations)
 * @param {Promise} promise - Promise to track
 * @param {Object} messages - Messages for pending, success, error
 */
export const notifyPromise = (promise, messages) => {
  return toast.promise(promise, {
    pending: messages.pending || 'Procesando...',
    success: messages.success || 'Operación completada',
    error: messages.error || 'Error al procesar',
  });
};

export default {
  success: notifySuccess,
  error: notifyError,
  warning: notifyWarning,
  info: notifyInfo,
  promise: notifyPromise,
};

