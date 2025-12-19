/**
 * Input Sanitization Utilities
 * Provides safe input sanitization functions to prevent XSS and injection attacks
 */

/**
 * Sanitize string input - removes potentially dangerous characters
 * @param {string} input - Input string to sanitize
 * @param {Object} options - Sanitization options
 * @returns {string} Sanitized string
 */
export const sanitizeString = (input, options = {}) => {
  if (typeof input !== 'string') {
    return '';
  }

  const {
    maxLength = 10000,
    allowHtml = false,
    trim = true,
  } = options;

  let sanitized = input;

  // Trim whitespace
  if (trim) {
    sanitized = sanitized.trim();
  }

  // Remove HTML tags if not allowed
  if (!allowHtml) {
    sanitized = sanitized.replace(/<[^>]*>/g, '');
    // Escape HTML entities
    sanitized = sanitized
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }

  // Limit length
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }

  return sanitized;
};

/**
 * Sanitize URL - validates and sanitizes URL strings
 * @param {string} url - URL to sanitize
 * @returns {string|null} Sanitized URL or null if invalid
 */
export const sanitizeUrl = (url) => {
  if (typeof url !== 'string' || !url.trim()) {
    return null;
  }

  try {
    const urlObj = new URL(url.trim());
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return null;
    }
    return urlObj.toString();
  } catch {
    return null;
  }
};

/**
 * Sanitize number - ensures value is a valid number
 * @param {*} value - Value to sanitize
 * @param {Object} options - Options (min, max, integer)
 * @returns {number|null} Sanitized number or null if invalid
 */
export const sanitizeNumber = (value, options = {}) => {
  const {
    min = -Infinity,
    max = Infinity,
    integer = false,
  } = options;

  const num = Number(value);

  if (isNaN(num)) {
    return null;
  }

  const finalNum = integer ? Math.floor(num) : num;

  if (finalNum < min || finalNum > max) {
    return null;
  }

  return finalNum;
};

/**
 * Sanitize array - ensures value is an array and sanitizes items
 * @param {*} value - Value to sanitize
 * @param {Function} itemSanitizer - Function to sanitize each item
 * @returns {Array} Sanitized array
 */
export const sanitizeArray = (value, itemSanitizer = null) => {
  if (!Array.isArray(value)) {
    return [];
  }

  if (itemSanitizer && typeof itemSanitizer === 'function') {
    return value.map(item => itemSanitizer(item)).filter(item => item !== null && item !== undefined);
  }

  return value;
};

/**
 * Sanitize object - sanitizes object properties
 * @param {Object} obj - Object to sanitize
 * @param {Object} schema - Schema defining how to sanitize each property
 * @returns {Object} Sanitized object
 */
export const sanitizeObject = (obj, schema = {}) => {
  if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) {
    return {};
  }

  const sanitized = {};

  for (const [key, value] of Object.entries(obj)) {
    if (schema[key]) {
      const sanitizer = schema[key];
      if (typeof sanitizer === 'function') {
        sanitized[key] = sanitizer(value);
      } else if (typeof sanitizer === 'object') {
        // Recursive sanitization for nested objects
        sanitized[key] = sanitizeObject(value, sanitizer);
      }
    } else {
      // Default: sanitize as string
      sanitized[key] = typeof value === 'string' ? sanitizeString(value) : value;
    }
  }

  return sanitized;
};

/**
 * Sanitize form data - sanitizes form input values
 * @param {Object} formData - Form data object
 * @param {Object} schema - Sanitization schema
 * @returns {Object} Sanitized form data
 */
export const sanitizeFormData = (formData, schema = {}) => {
  return sanitizeObject(formData, schema);
};
