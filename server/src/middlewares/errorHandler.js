'use strict';
const AppError = require('../utils/AppError');
const { sendError } = require('../utils/apiResponse');
const { NODE_ENV } = require('../config/env');

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  error.name = err.name;
  error.statusCode = err.statusCode;

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = `Resource not found with id of ${err.value}`;
    error = new AppError(message, 400);
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `Duplicate field value entered for ${field}`;
    error = new AppError(message, 409);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = new AppError(message, 400);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = new AppError('Invalid token. Please log in again.', 401);
  }
  if (err.name === 'TokenExpiredError') {
    error = new AppError('Your token has expired. Please log in again.', 401);
  }

  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal Server Error';

  if (NODE_ENV === 'development') {
    console.error(err);
    res.status(statusCode).json({
      success: false,
      message,
      error: err,
      stack: err.stack
    });
  } else {
    sendError(res, statusCode, error.isOperational ? message : 'Internal Server Error');
  }
};

module.exports = errorHandler;
