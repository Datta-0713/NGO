'use strict';
const cron = require('node-cron');
const contributorService = require('../services/contributorService');

// Runs every Monday at midnight: 0 0 * * 1
const scheduleWeeklyJob = () => {
  cron.schedule('0 0 * * 1', async () => {
    try {
      console.log('Running weekly contributor highlight calculation...');
      await contributorService.calculateWeeklyTopContributor();
      console.log('Weekly contributor highlight calculation completed.');
    } catch (error) {
      console.error('Error in weekly contributor job:', error);
    }
  });
};

module.exports = scheduleWeeklyJob;
