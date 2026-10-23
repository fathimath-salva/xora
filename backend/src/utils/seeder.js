/**
 * XORA Catalogue Seeder
 *
 * Safe idempotent seed script. Can be run repeatedly without duplicating data.
 *
 * What it does:
 *   1. Upserts the 4 target categories (T-Shirts, Hoodies, Shirts, Trousers).
 *   2. Upserts all 20 catalogue products by name+gender as the upsert key.
 *      - On insert: stock is set to the seed value.
 *      - On update: catalogFields are refreshed but stock is NOT overwritten
 *        (preserving any inventory adjustments made since last seed).
 *   3. Refuses to run if the target contains products outside the seed catalogue.
 *      It never archives or deletes unrelated products, categories, or collections.
 *
 * What it does NOT touch:
 *   - User accounts
 *   - Orders / order history
 *   - Carts and wishlists
 *   - Product stock of existing seeded items
 *   - Any other collection outside Product, Category, and Collection
 *
 * Run only against the exact dedicated local database:
 *   XORA_SEED_TARGET=local
 *   MONGODB_URI=mongodb://127.0.0.1:27017/xora_catalogue_seed
 *   npm run seed       (from backend directory)
 */

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import Product from '../models/Product.js';
import Category from '../models/Category.js';
import Collection from '../models/Collection.js';
import { categoriesData, collectionsData, productsData } from './seedData.js';

dotenv.config();

const toSlug = (value) => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const SEED_DATABASE_NAME = 'xora_catalogue_seed';

const assertLocalSeedTarget = () => {
  const uri = process.env.MONGODB_URI;
  let parsed;
  try { parsed = new URL(uri); } catch { throw new Error(`Set MONGODB_URI to mongodb://127.0.0.1:27017/${SEED_DATABASE_NAME}.`); }
  let databaseName;
  try { databaseName = decodeURIComponent(parsed.pathname.replace(/^\//, '')); } catch {
    throw new Error(`The seed database must be named ${SEED_DATABASE_NAME}.`);
  }
  if (process.env.XORA_SEED_TARGET !== 'local'
    || parsed.protocol !== 'mongodb:'
    || parsed.hostname !== '127.0.0.1'
    || databaseName !== SEED_DATABASE_NAME) {
    throw new Error(`Seeding is allowed only with XORA_SEED_TARGET=local and MongoDB at 127.0.0.1 using database ${SEED_DATABASE_NAME}.`);
  }
};

const assertConnectedSeedTarget = () => {
  if (mongoose.connection.host !== '127.0.0.1' || mongoose.connection.name !== SEED_DATABASE_NAME) {
    throw new Error(`Connected MongoDB target did not match 127.0.0.1/${SEED_DATABASE_NAME}; refusing to write.`);
  }
};

const assertCatalogueProducts = async () => {
  const catalogue = productsData.filter((product) => product.gender === 'men');
  const categories = ['T-Shirts', 'Hoodies', 'Shirts', 'Trousers'];
  const expectedKeys = new Set(catalogue.map((product) => `men:${product.name}`));
  if (catalogue.length !== 20 || expectedKeys.size !== 20
    || categories.some((category) => catalogue.filter((product) => product.category === category).length !== 5)) {
    throw new Error('Seed data must contain exactly 20 unique men’s products with five in each target category.');
  }

  const existing = await Product.find({}).select('name gender').lean();
  const seen = new Set();
  const unexpected = [];
  for (const product of existing) {
    const key = `${product.gender}:${product.name}`;
    if (!expectedKeys.has(key) || seen.has(key)) unexpected.push(product.name || '(unnamed product)');
    seen.add(key);
  }
  if (unexpected.length) {
    const names = [...new Set(unexpected)].slice(0, 5).join(', ');
    throw new Error(`Refusing to seed: target contains ${unexpected.length} unexpected or duplicate product record(s)${names ? ` (${names})` : ''}. No catalogue writes were made.`);
  }
  console.log(`[Seeder] Product preflight passed (${existing.length} matching catalogue product(s); no unexpected or duplicate records).`);
};

const seed = async () => {
  try {
    assertLocalSeedTarget();
    await connectDB();
    assertConnectedSeedTarget();
    // This preflight runs before any writes. An empty dedicated database or a
    // prior run of this exact catalogue is allowed; unrelated/duplicate rows abort.
    await assertCatalogueProducts();

    // ── 1. Upsert target categories only; leave every other category untouched. ──
    await Category.bulkWrite(
      categoriesData.map((category) => ({
        updateOne: {
          filter: { slug: category.slug },
          // Refresh catalogue copy without deleting category records that may be
          // referenced elsewhere. The itemCount is recalculated below.
          update: { $set: { ...category, active: true } },
          upsert: true
        }
      }))
    );
    console.log(`[Seeder] Upserted ${categoriesData.length} categories.`);

    // ── 2. Upsert target collections only; leave every other collection untouched. ──
    await Collection.bulkWrite(collectionsData.map((collection) => ({
      updateOne: {
        filter: { slug: collection.slug },
        update: { $set: { ...collection, active: true } },
        upsert: true
      }
    })));
    console.log(`[Seeder] Upserted ${collectionsData.length} collections.`);

    // ── 3. Prepare product documents ──
    const menProducts = productsData
      .filter((product) => product.gender === 'men')
      .map(({ priceInr, discountPriceInr, stock, active, ...rest }) => ({
        ...rest,
        // The live catalogue uses one distinct, client-reviewable photo per
        // product so reused editorial images cannot bleed between SKUs.
        images: rest.images.slice(0, 1),
        slug: toSlug(rest.name),
        // The application stores catalog units and converts them to INR at
        // presentation time (83 catalog units per rupee).
        price: priceInr / 83,
        discountPrice: discountPriceInr === null ? null : discountPriceInr / 83,
        gender: 'men',
        active: active !== false,
        _seedStock: stock                                         // carry stock separately
      }));

    // ── 4. Upsert products (preserving stock on existing records) ──
    const bulkOps = menProducts.map(({ _seedStock, ...catalogFields }) => ({
      updateOne: {
        filter: { name: catalogFields.name, gender: 'men' },
        update: {
          $set: { ...catalogFields },
          $setOnInsert: { stock: _seedStock }
        },
        upsert: true
      }
    }));

    await Product.bulkWrite(bulkOps);
    console.log(`[Seeder] Upserted ${menProducts.length} men's products.`);

    // ── 5. Update target category item counts. ──
    for (const category of categoriesData) {
      const count = await Product.countDocuments({ category: category.name, gender: 'men', active: true });
      await Category.updateOne({ slug: category.slug }, { $set: { itemCount: count } });
    }
    console.log('[Seeder] Category item counts updated.');

    console.log('[Seeder] Done. No unrelated product, category, or collection records were archived or deleted.');
  } catch (error) {
    console.error(`[Seeder Error]: ${error.message}`);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

seed();
