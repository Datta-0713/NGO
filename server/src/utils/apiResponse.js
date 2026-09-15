'use strict';

/**
 * Sends a standardised success response.
 * Shape: { success: true, data, message }
 */
const sendSuccess = (res, statusCode = 200, data = null, message = 'Success') => {
  return res.status(statusCode).json({ success: true, data, message });
};

/**
 * Sends a standardised error response.
 * Shape: { success: false, data: null, message }
 */
const sendError = (res, statusCode = 500, message = 'Internal Server Error') => {
  return res.status(statusCode).json({ success: false, data: null, message });
};

module.exports = { sendSuccess, sendError };
