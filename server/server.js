'use strict';
// 1. Load env config first
const { PORT } = require('./src/config/env');

// 2. Import connectDB
const connectDB = require('./src/config/db');

// 3. Import app
const app = require('./src/app');

// 4. Import cron jobs and schedule them
const scheduleWeeklyJob = require('./src/jobs/weeklyContributor');
const scheduleMonthlyJob = require('./src/jobs/monthlyContributor');

// 5. connectDB()
connectDB();

// Schedule Jobs
scheduleWeeklyJob();
scheduleMonthlyJob();

// 6. app.listen(PORT)
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! 💥 Shutting down...');
  console.error(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
