'use strict';
const mongoose = require('mongoose');
const { MONGO_URI } = require('./env');

let retryCount = 0;
const MAX_RETRIES = 5;

/**
 * Connects to MongoDB with exponential backoff retry logic.
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
    retryCount = 0;
  } catch (error) {
    retryCount += 1;
    console.error(`❌ MongoDB connection failed (attempt ${retryCount}/${MAX_RETRIES}): ${error.message}`);
    if (retryCount >= MAX_RETRIES) {
      console.error('Max retries reached. Exiting.');
      process.exit(1);
    }
    const delay = Math.min(1000 * 2 ** retryCount, 30000);
    console.log(`Retrying in ${delay / 1000}s...`);
    setTimeout(connectDB, delay);
  }
};

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️  MongoDB disconnected.');
});

module.exports = connectDB;
