import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto';
import { env } from '../config/env.js';

const encode = (value) => Buffer.from(JSON.stringify(value)).toString('base64url');
const sign = (input) => createHmac('sha256', env.JWT_SECRET).update(input).digest('base64url');

export function issueToken(userId) {
  const now = Math.floor(Date.now() / 1000);
  const ttlSeconds = env.JWT_TTL_SECONDS;
  const header = encode({ alg: 'HS256', typ: 'JWT' });
  const payload = encode({ iss: 'yaqana-api', aud: 'yaqana-storefront', sub: String(userId), jti: randomUUID(), iat: now, exp: now + ttlSeconds });
  const unsigned = `${header}.${payload}`;
  return { token: `${unsigned}.${sign(unsigned)}`, jti: JSON.parse(Buffer.from(payload, 'base64url').toString()).jti, expiresAt: new Date((now + ttlSeconds) * 1000) };
}

export function verifyToken(token) {
  if (typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const unsigned = `${parts[0]}.${parts[1]}`;
  const expected = Buffer.from(sign(unsigned));
  const actual = Buffer.from(parts[2]);
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return null;
  try {
    const header = JSON.parse(Buffer.from(parts[0], 'base64url').toString());
    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString());
    if (header.alg !== 'HS256' || payload.iss !== 'yaqana-api' || payload.aud !== 'yaqana-storefront' || !payload.sub || !payload.jti || !Number.isFinite(payload.exp) || payload.exp <= Date.now() / 1000) return null;
    return payload;
  } catch { return null; }
}
