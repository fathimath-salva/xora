import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Category from '../src/models/Category.js';
import { slugify } from '../src/utils/http.js';
dotenv.config();
const { MONGODB_URI } = process.env;
if (!MONGODB_URI) throw new Error('MONGODB_URI is required.');
const categories = [
  { name: 'T-Shirts', image: '/images/yaqana-categories/t-shirt.jpeg' },
  { name: 'Hoodies', image: '/images/yaqana-categories/hoodie%20(1).jpeg' },
  { name: 'Shirts', image: '/images/yaqana-categories/shirt.jpeg' },
  { name: 'Trousers', image: '/images/yaqana-categories/trouser.jpeg' }
];
try {
  await mongoose.connect(MONGODB_URI);
  for (const category of categories) {
    await Category.updateOne({ slug: slugify(category.name) }, { $setOnInsert: { ...category, slug: slugify(category.name), gender: 'men', active: true } }, { upsert: true });
  }
  process.stdout.write('The four existing YAQANA storefront categories are present. Existing category records were not overwritten.\n');
} finally { await mongoose.disconnect(); }
