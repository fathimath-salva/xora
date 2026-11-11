import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(5000),
  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_TTL_SECONDS: z.coerce.number().int().min(300).max(2592000).default(86400),
  LEGACY_CURRENCY_FACTOR: z.coerce.number().positive().default(83),
  LEGACY_SHIPPING_THRESHOLD: z.coerce.number().nonnegative().default(200),
  LEGACY_SHIPPING_FEE: z.coerce.number().nonnegative().default(15),
  LEGACY_TAX_RATE: z.coerce.number().min(0).max(1).default(0.08),
  FRONTEND_ORIGINS: z.string().default('http://localhost:3000'),
  TRUST_PROXY: z.enum(['true', 'false']).default('false'),
  LOG_LEVEL: z.string().default('info')
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  const details = parsed.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('; ');
  throw new Error(`Invalid environment configuration: ${details}`);
}

const origins = parsed.data.FRONTEND_ORIGINS.split(',').map((value) => value.trim()).filter(Boolean);
for (const origin of origins) {
  let parsedOrigin;
  try { parsedOrigin = new URL(origin); } catch { throw new Error(`Invalid FRONTEND_ORIGINS entry: ${origin}`); }
  if (parsedOrigin.origin !== origin) throw new Error(`FRONTEND_ORIGINS must contain exact origins: ${origin}`);
  if (parsed.data.NODE_ENV === 'production' && parsedOrigin.protocol !== 'https:') {
    throw new Error('Production FRONTEND_ORIGINS entries must use HTTPS.');
  }
}

export const env = Object.freeze({ ...parsed.data, allowedOrigins: origins });
