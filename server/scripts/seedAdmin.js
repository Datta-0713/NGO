'use strict';
/**
 * scripts/seedAdmin.js
 *
 * Creates the first admin user for the Asian News Bureau platform.
 * Run once after initial setup:
 *   node scripts/seedAdmin.js
 *
 * Reads credentials from environment (or defaults below).
 * Will NOT create a duplicate if the email already exists.
 */

require('dotenv').config({ path: '../.env' });

const mongoose = require('mongoose');
const readline = require('readline');

// Load env validation — will throw if required vars are missing
const { MONGO_URI } = require('../src/config/env');
const User = require('../src/models/User');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise((resolve) => rl.question(q, resolve));

const run = async () => {
  console.log('\n🌱  Asian News Bureau — Admin Seed Script\n');

  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected to MongoDB\n');

  const name     = await ask('Admin name     : ');
  const email    = await ask('Admin email    : ');
  const password = await ask('Admin password : ');

  rl.close();

  if (!name || !email || !password) {
    console.error('❌ All fields are required.');
    process.exit(1);
  }
  if (password.length < 8) {
    console.error('❌ Password must be at least 8 characters.');
    process.exit(1);
  }

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    if (existing.role === 'admin') {
      console.log(`\n⚠️  An admin with email "${email}" already exists. Nothing changed.\n`);
    } else {
      existing.role = 'admin';
      await existing.save();
      console.log(`\n✅ Existing user "${email}" promoted to admin.\n`);
    }
    process.exit(0);
  }

  await User.create({
    name:         name.trim(),
    email:        email.toLowerCase().trim(),
    passwordHash: password,   // User pre-save hook will hash this
    role:         'admin',
    credits:      0,
  });

  console.log(`\n✅ Admin account created successfully!`);
  console.log(`   Name  : ${name}`);
  console.log(`   Email : ${email}`);
  console.log(`   Role  : admin`);
  console.log('\n👉 You can now log in to the admin panel at http://localhost:5173\n');
  process.exit(0);
};

run().catch((err) => {
  console.error('❌ Seed script failed:', err.message);
  process.exit(1);
});
