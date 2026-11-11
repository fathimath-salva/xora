import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../src/models/User.js';
import { hashPassword } from '../src/utils/password.js';
dotenv.config();
const { MONGODB_URI, BOOTSTRAP_ADMIN_EMAIL, BOOTSTRAP_ADMIN_PASSWORD, BOOTSTRAP_ADMIN_NAME = 'YAQANA Owner' } = process.env;
if (!MONGODB_URI || !BOOTSTRAP_ADMIN_EMAIL || !BOOTSTRAP_ADMIN_PASSWORD || BOOTSTRAP_ADMIN_PASSWORD.length < 12) {
  throw new Error('Set MONGODB_URI, BOOTSTRAP_ADMIN_EMAIL and BOOTSTRAP_ADMIN_PASSWORD (minimum 12 characters) before running this script.');
}
try {
  await mongoose.connect(MONGODB_URI);
  const email = BOOTSTRAP_ADMIN_EMAIL.trim().toLowerCase();
  const existing = await User.findOne({ email });
  if (existing) throw new Error('An account with this email already exists. This script will not silently elevate an existing account.');
  await User.create({ name: BOOTSTRAP_ADMIN_NAME, email, passwordHash: await hashPassword(BOOTSTRAP_ADMIN_PASSWORD), role: 'admin' });
  process.stdout.write(`Administrator account created for ${email}. Store the credentials securely and remove them from the environment.\n`);
} finally {
  await mongoose.disconnect();
}
