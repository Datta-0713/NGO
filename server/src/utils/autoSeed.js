const mongoose = require('mongoose');
const User = require('../models/User');

const autoSeedAdmin = async () => {
  try {
    const adminEmail = 'admin@asiannewsbureau.org';
    const existingAdmin = await User.findOne({ email: adminEmail });
    
    if (!existingAdmin) {
      console.log('🌱 Auto-seeding default admin account...');
      await User.create({
        name: 'Super Admin',
        email: adminEmail,
        passwordHash: 'admin123',
        role: 'admin',
        credits: 0,
      });
      console.log('✅ Default Admin created: admin@asiannewsbureau.org / admin123');
    }
  } catch (err) {
    console.error('Failed to auto-seed admin:', err);
  }
};

module.exports = autoSeedAdmin;
