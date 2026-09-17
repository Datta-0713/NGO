'use strict';
const mongoose = require('mongoose');

const withTransaction = async (work) => {
  const session = await mongoose.startSession();
  try {
    let result;
    await session.withTransaction(async () => {
      result = await work(session);
    });
    return result;
  } catch (error) {
    if (/Transaction numbers are only allowed|replica set|transaction/i.test(error.message || '')) {
      error.message = 'Database transactions require MongoDB Atlas or a MongoDB replica set in production.';
    }
    throw error;
  } finally {
    await session.endSession();
  }
};

module.exports = { withTransaction };
