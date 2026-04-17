'use strict';

/**
 * Seed script – creates default admin user if none exists.
 *
 * Usage:
 *   MONGODB_URI=... ADMIN_USERNAME=... ADMIN_PASSWORD=... node seed.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mww';
const ADMIN_USER = process.env.ADMIN_USERNAME || 'mww';
const ADMIN_PASS = process.env.ADMIN_PASSWORD || 'MWW2024!Secure';

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✓ Connected to MongoDB');

    const existing = await User.findOne({ username: ADMIN_USER.toLowerCase() });
    if (existing) {
      console.log(`✓ Admin user "${ADMIN_USER}" already exists – skipping.`);
    } else {
      await User.create({
        username: ADMIN_USER.toLowerCase(),
        password: ADMIN_PASS,
        role: 'admin',
        active: true,
      });
      console.log(`✓ Admin user "${ADMIN_USER}" created successfully.`);
    }
  } catch (err) {
    console.error('✗ Seed error:', err.message);
  } finally {
    await mongoose.disconnect();
    console.log('✓ Disconnected from MongoDB');
  }
}

seed();
