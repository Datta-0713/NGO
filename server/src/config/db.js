'use strict';
const mongoose = require('mongoose');
const { MONGO_URI, NODE_ENV } = require('./env');

let connected = false;
const connectDB = async () => {
  if (connected && mongoose.connection.readyState === 1) return;
  const conn = await mongoose.connect(MONGO_URI, {
    serverSelectionTimeoutMS: 10_000,
    maxPoolSize: NODE_ENV === 'production' ? 20 : 10,
    minPoolSize: NODE_ENV === 'production' ? 2 : 0,
  });
  connected = true;
  console.log(`✅ MongoDB connected: ${conn.connection.host}`);
};

mongoose.connection.on('disconnected', () => { connected = false; console.warn('⚠️ MongoDB disconnected.'); });
mongoose.connection.on('error', (error) => console.error('MongoDB error:', error.message));

module.exports = connectDB;
