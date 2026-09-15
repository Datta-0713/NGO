'use strict';
const cron = require('node-cron');
const contributorService = require('../services/contributorService');

// Runs on 1st of every month at midnight: 0 0 1 * *
const scheduleMonthlyJob = () => {
  cron.schedule('0 0 1 * *', async () => {
    try {
      console.log('Running monthly contributor highlight calculation...');
      await contributorService.calculateMonthlyTopContributor();
      console.log('Monthly contributor highlight calculation completed.');
    } catch (error) {
      console.error('Error in monthly contributor job:', error);
    }
  });
};

module.exports = scheduleMonthlyJob;
