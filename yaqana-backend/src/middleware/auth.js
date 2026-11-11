import User from '../models/User.js';
import Session from '../models/Session.js';
import { verifyToken } from '../utils/token.js';
import { asyncHandler, httpError } from '../utils/http.js';

function bearer(req) {
  const value = req.headers.authorization || '';
  return value.startsWith('Bearer ') ? value.slice(7).trim() : null;
}

export const optionalAuth = asyncHandler(async (req, _res, next) => {
  const token = bearer(req);
  if (!token) return next();
  const payload = verifyToken(token);
  if (!payload) throw httpError(401, 'Your session is invalid or has expired.', 'INVALID_SESSION');
  const session = await Session.findOne({ jti: payload.jti, revokedAt: null, expiresAt: { $gt: new Date() } });
  if (!session) throw httpError(401, 'Your session is no longer active. Please sign in again.', 'SESSION_REVOKED');
  const user = await User.findById(payload.sub);
  if (!user || user.status !== 'active') throw httpError(401, 'Your account is unavailable.', 'ACCOUNT_UNAVAILABLE');
  req.user = user;
  req.session = session;
  req.tokenPayload = payload;
  next();
});

export const requireAuth = [optionalAuth, (req, _res, next) => {
  if (!req.user) return next(httpError(401, 'Please sign in to continue.', 'AUTHENTICATION_REQUIRED'));
  next();
}];

export const requireAdmin = (req, _res, next) => {
  if (req.user?.role !== 'admin') return next(httpError(403, 'Administrator access is required.', 'ADMIN_REQUIRED'));
  next();
};
