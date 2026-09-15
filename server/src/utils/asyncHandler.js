'use strict';

/**
 * Wraps an async Express route handler to forward errors to next().
 * Eliminates repetitive try/catch in every controller.
 * @param {Function} fn - Async route handler
 * @returns {Function} Wrapped handler
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
