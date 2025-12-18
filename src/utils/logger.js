/**
 * Logger Utility
 * Centralized logging system with different log levels
 * Supports development and production environments
 */

import { ENV } from '../config/env';

/**
 * Log levels
 */
const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
};

/**
 * Current log level based on environment
 */
const CURRENT_LOG_LEVEL = ENV.IS_DEVELOPMENT ? LOG_LEVELS.DEBUG : LOG_LEVELS.INFO;

/**
 * Format log message with timestamp and context
 */
const formatMessage = (level, message, context = null) => {
  const timestamp = new Date().toISOString();
  const contextStr = context ? ` [${context}]` : '';
  return `[${timestamp}] [${level}]${contextStr} ${message}`;
};

/**
 * Logger object with different log levels
 */
export const logger = {
  /**
   * Debug logs - only in development
   * @param {string} message - Log message
   * @param {*} data - Additional data to log
   * @param {string} context - Context where log occurred
   */
  debug: (message, data = null, context = null) => {
    if (CURRENT_LOG_LEVEL <= LOG_LEVELS.DEBUG) {
      const formatted = formatMessage('DEBUG', message, context);
      if (data) {
        console.debug(formatted, data);
      } else {
        console.debug(formatted);
      }
    }
  },

  /**
   * Info logs
   * @param {string} message - Log message
   * @param {*} data - Additional data to log
   * @param {string} context - Context where log occurred
   */
  info: (message, data = null, context = null) => {
    if (CURRENT_LOG_LEVEL <= LOG_LEVELS.INFO) {
      const formatted = formatMessage('INFO', message, context);
      if (data) {
        console.info(formatted, data);
      } else {
        console.info(formatted);
      }
    }
  },

  /**
   * Warning logs
   * @param {string} message - Log message
   * @param {*} data - Additional data to log
   * @param {string} context - Context where log occurred
   */
  warn: (message, data = null, context = null) => {
    if (CURRENT_LOG_LEVEL <= LOG_LEVELS.WARN) {
      const formatted = formatMessage('WARN', message, context);
      if (data) {
        console.warn(formatted, data);
      } else {
        console.warn(formatted);
      }
    }
  },

  /**
   * Error logs
   * @param {string} message - Log message
   * @param {Error|*} error - Error object
   * @param {string} context - Context where error occurred
   */
  error: (message, error = null, context = null) => {
    if (CURRENT_LOG_LEVEL <= LOG_LEVELS.ERROR) {
      const formatted = formatMessage('ERROR', message, context);
      
      if (error) {
        console.error(formatted, error);
        
        // In production, send to error tracking service
        if (ENV.IS_PRODUCTION) {
          // TODO: Integrate with error tracking service (Sentry, LogRocket, etc.)
          // Example:
          // if (window.Sentry) {
          //   window.Sentry.captureException(error, {
          //     extra: { message, context }
          //   });
          // }
        }
      } else {
        console.error(formatted);
      }
    }
  },
};

export default logger;

