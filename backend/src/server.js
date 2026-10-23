import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { rateLimit } from './middleware/rateLimit.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from './config/db.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';
import Order from './models/Order.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import wishlistRoutes from './routes/wishlistRoutes.js';
import addressRoutes from './routes/addressRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';

dotenv.config();

const configurationErrors = [];
if (!['development', 'production'].includes(process.env.NODE_ENV)) {
  configurationErrors.push('NODE_ENV must be explicitly set to development or production.');
}
const production = process.env.NODE_ENV === 'production';
if (production && !process.env.MONGODB_URI) configurationErrors.push('MONGODB_URI is required in production.');
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) configurationErrors.push('JWT_SECRET must contain at least 32 characters.');
if (production && !process.env.CORS_ORIGINS) configurationErrors.push('CORS_ORIGINS must explicitly list approved production origins.');
const configuredOrigins = (process.env.CORS_ORIGINS || [
  'https://xora-clothing-demo.vercel.app', 'http://localhost:3000', 'http://127.0.0.1:3000'
].join(',')).split(',').map((origin) => origin.trim()).filter(Boolean);
for (const origin of configuredOrigins) {
  try {
    const parsed = new URL(origin);
    if (parsed.origin !== origin || (production && parsed.protocol !== 'https:')) configurationErrors.push('CORS_ORIGINS entries must be exact origins (HTTPS in production).');
  } catch {
    configurationErrors.push('CORS_ORIGINS contains an invalid origin.');
  }
}
if (configurationErrors.length) {
  console.error(`[XORA startup] ${configurationErrors.join(' ')}`);
  process.exit(1);
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.set('trust proxy', 1);

// Middleware
const allowedOrigins = configuredOrigins;
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Origin is not allowed by CORS.'));
  },
  credentials: true
}));
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  if (process.env.NODE_ENV === 'production') res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
});
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve static uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'healthy', brand: 'XORA Luxury Fashion API', timestamp: new Date() });
});

// API Routes
app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, max: 30 }), authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

connectDB().then(async () => {
  if (production) {
    try {
      const indexes = await Order.collection.indexes();
      const hasCheckoutIndex = indexes.some(({ key, unique, partialFilterExpression }) => (
        key?.customer === 1 && key?.idempotencyKey === 1 && Object.keys(key).length === 2 && unique === true &&
        partialFilterExpression?.idempotencyKey?.$type === 'string'
      ));
      if (!hasCheckoutIndex) throw new Error('Required checkout index is missing or misconfigured.');
      const topologyType = Order.db.getClient().topology?.description?.type;
      if (!['ReplicaSetWithPrimary', 'Sharded'].includes(topologyType)) {
        throw new Error('Production MongoDB must support transactions.');
      }
    } catch {
      console.error('[XORA startup] Production database validation failed. Verify the checkout index and transaction-capable MongoDB topology.');
      process.exit(1);
    }
  }
  app.listen(PORT, () => {
    console.log(`[XORA Backend] Server listening on port ${PORT}`);
  });
});
