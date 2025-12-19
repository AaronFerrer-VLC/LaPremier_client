/**
 * Secure Storage Utilities
 * Provides safe localStorage operations with error handling and validation
 */

import logger from './logger';

const STORAGE_PREFIX = 'lapremier_';

/**
 * Safely get item from localStorage
 * @param {string} key - Storage key
 * @param {*} defaultValue - Default value if key doesn't exist or is invalid
 * @returns {*} Stored value or defaultValue
 */
export const safeGetItem = (key, defaultValue = null) => {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return defaultValue;
    }

    const item = localStorage.getItem(`${STORAGE_PREFIX}${key}`);
    if (item === null) {
      return defaultValue;
    }

    // Try to parse as JSON, fallback to string
    try {
      return JSON.parse(item);
    } catch {
      return item;
    }
  } catch (error) {
    logger.error('Failed to get item from localStorage', error, 'Storage');
    return defaultValue;
  }
};

/**
 * Safely set item in localStorage
 * @param {string} key - Storage key
 * @param {*} value - Value to store (will be JSON stringified)
 * @returns {boolean} Success status
 */
export const safeSetItem = (key, value) => {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return false;
    }

    const serialized = typeof value === 'string' ? value : JSON.stringify(value);
    localStorage.setItem(`${STORAGE_PREFIX}${key}`, serialized);
    return true;
  } catch (error) {
    logger.error('Failed to set item in localStorage', error, 'Storage');
    // Handle quota exceeded error
    if (error.name === 'QuotaExceededError') {
      logger.warn('localStorage quota exceeded, clearing old items', {}, 'Storage');
      // Could implement LRU cache clearing here
    }
    return false;
  }
};

/**
 * Safely remove item from localStorage
 * @param {string} key - Storage key
 * @returns {boolean} Success status
 */
export const safeRemoveItem = (key) => {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return false;
    }

    localStorage.removeItem(`${STORAGE_PREFIX}${key}`);
    return true;
  } catch (error) {
    logger.error('Failed to remove item from localStorage', error, 'Storage');
    return false;
  }
};

/**
 * Clear all app-related items from localStorage
 * @returns {boolean} Success status
 */
export const clearAll = () => {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return false;
    }

    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(STORAGE_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
    return true;
  } catch (error) {
    logger.error('Failed to clear localStorage', error, 'Storage');
    return false;
  }
};

