import User from '../models/User.js';
import Session from '../models/Session.js';
import { hashPassword, verifyPassword } from '../utils/password.js';
import { issueToken } from '../utils/token.js';
import { asyncHandler, httpError } from '../utils/http.js';

const publicUser = (user) => ({
  _id: String(user._id), id: String(user._id), name: user.name, email: user.email,
  phone: user.phone || '', role: user.role, status: user.status, createdAt: user.createdAt
});

async function createSession(user) {
  const issued = issueToken(user._id);
  await Session.create({ user: user._id, jti: issued.jti, expiresAt: issued.expiresAt });
  return { success: true, token: issued.token, user: publicUser(user) };
}

export const register = asyncHandler(async (req, res) => {
  const name = String(req.body?.name || '').trim();
  const email = String(req.body?.email || '').trim().toLowerCase();
  const password = String(req.body?.password || '');
  const confirmPassword = String(req.body?.confirmPassword || '');
  if (name.length < 2 || name.length > 100) throw httpError(400, 'Please enter a valid name.');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) throw httpError(400, 'Please enter a valid email address.');
  if (password.length < 8 || password.length > 128) throw httpError(400, 'Password must contain at least 8 characters.');
  if (confirmPassword && password !== confirmPassword) throw httpError(400, 'Passwords do not match.');
  if (await User.exists({ email })) throw httpError(409, 'An account with this email already exists.', 'EMAIL_ALREADY_REGISTERED');
  const user = await User.create({ name, email, passwordHash: await hashPassword(password), role: 'customer' });
  res.status(201).json(await createSession(user));
});

export const login = asyncHandler(async (req, res) => {
  const email = String(req.body?.email || '').trim().toLowerCase();
  const password = String(req.body?.password || '');
  const user = await User.findOne({ email }).select('+passwordHash');
  if (!user || !(await verifyPassword(password, user.passwordHash))) throw httpError(401, 'Invalid email or password.', 'INVALID_CREDENTIALS');
  if (user.status !== 'active') throw httpError(403, 'This account is currently unavailable.', 'ACCOUNT_BLOCKED');
  res.status(200).json(await createSession(user));
});

export const getProfile = asyncHandler(async (req, res) => res.json({ success: true, user: publicUser(req.user) }));

export const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone } = req.body || {};
  if (name !== undefined) {
    const value = String(name).trim();
    if (value.length < 2 || value.length > 100) throw httpError(400, 'Name must be between 2 and 100 characters.');
    req.user.name = value;
  }
  if (phone !== undefined) {
    const value = String(phone).trim();
    if (value.length > 25) throw httpError(400, 'Phone number is invalid.');
    req.user.phone = value;
  }
  await req.user.save();
  res.json({ success: true, message: 'Profile updated successfully.', user: publicUser(req.user) });
});

export const changePassword = asyncHandler(async (req, res) => {
  const currentPassword = String(req.body?.currentPassword || req.body?.oldPassword || '');
  const newPassword = String(req.body?.newPassword || req.body?.password || '');
  const user = await User.findById(req.user._id).select('+passwordHash');
  if (!await verifyPassword(currentPassword, user.passwordHash)) throw httpError(400, 'Current password is incorrect.', 'CURRENT_PASSWORD_INCORRECT');
  if (newPassword.length < 8 || newPassword.length > 128) throw httpError(400, 'New password must contain at least 8 characters.');
  user.passwordHash = await hashPassword(newPassword);
  await user.save();
  await Session.updateMany({ user: user._id, revokedAt: null }, { $set: { revokedAt: new Date() } });
  res.json({ success: true, message: 'Password changed. Please sign in again.' });
});

export const logout = asyncHandler(async (req, res) => {
  if (req.session) await Session.updateOne({ _id: req.session._id, revokedAt: null }, { $set: { revokedAt: new Date() } });
  res.json({ success: true, message: 'Logged out successfully.' });
});
