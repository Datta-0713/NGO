'use strict';
const { PORT, NODE_ENV } = require('./src/config/env');
const mongoose = require('mongoose');
const connectDB = require('./src/config/db');
const app = require('./src/app');
const scheduleWeeklyJob = require('./src/jobs/weeklyContributor');
const scheduleMonthlyJob = require('./src/jobs/monthlyContributor');
const { schedulePushReceiptJob } = require('./src/jobs/pushReceipts');

let server;

const start = async () => {
  await connectDB();
  scheduleWeeklyJob();
  scheduleMonthlyJob();
  schedulePushReceiptJob();
  server = app.listen(PORT, () => console.log(`🚀 Server running in ${NODE_ENV} mode on port ${PORT}`));
};

const shutdown = async (signal) => {
  console.log(`${signal} received. Shutting down gracefully.`);
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
  await mongoose.connection.close(false);
  process.exit(0);
};

process.on('unhandledRejection', (error) => {
  console.error('UNHANDLED REJECTION:', error);
  shutdown('unhandledRejection').catch(() => process.exit(1));
});
process.on('uncaughtException', (error) => {
  console.error('UNCAUGHT EXCEPTION:', error);
  shutdown('uncaughtException').catch(() => process.exit(1));
});
process.on('SIGTERM', () => void shutdown('SIGTERM'));
process.on('SIGINT', () => void shutdown('SIGINT'));

start().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
