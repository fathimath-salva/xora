import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || (process.env.NODE_ENV === 'production' ? null : 'mongodb://127.0.0.1:27017/xora_ecommerce');
    if (!mongoUri) throw new Error('MONGODB_URI is required in production.');
    const conn = await mongoose.connect(mongoUri, { autoIndex: process.env.NODE_ENV !== 'production' });
    console.log(`[MongoDB] Connected: ${conn.connection.host}/${conn.connection.name}`);
  } catch {
    console.error('[MongoDB] Connection failed. Check MONGODB_URI and database availability.');
    process.exit(1);
  }
};
