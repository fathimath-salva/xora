import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { categoriesData, productsData } from './seedData.js';

const CATEGORIES = ['T-Shirts', 'Hoodies', 'Shirts', 'Trousers'];
const CATALOG_UNITS_PER_RUPEE = 83;
const CONFIRMED_DEMO_DATABASE = 'test';

export const normalizeProductName = (name) => String(name)
  .normalize('NFKC')
  .trim()
  .replace(/\s+/g, ' ')
  .toLocaleLowerCase('en-US');

const identityKey = (product) => `${normalizeProductName(product.name)}|${String(product.gender).toLowerCase()}`;
const toSlug = (value) => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const validateSeedCategories = (categories) => {
  if (!Array.isArray(categories) || categories.length !== CATEGORIES.length) {
    throw new Error('Seed catalogue must define exactly four categories.');
  }

  const slugs = new Set();
  for (const category of categories) {
    if (!category || typeof category !== 'object'
      || !CATEGORIES.includes(category.name)
      || category.slug !== toSlug(category.name)
      || category.gender !== 'men') {
      throw new Error('Seed catalogue contains an invalid category definition.');
    }
    if (slugs.has(category.slug)) throw new Error('Seed catalogue contains duplicate category slugs.');
    slugs.add(category.slug);
  }
};

export function parseImporterArgs(argv) {
  let databaseName;
  let apply = false;
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--apply') {
      apply = true;
      continue;
    }
    if (arg === '--database') {
      databaseName = argv[index + 1];
      index += 1;
      continue;
    }
    if (arg.startsWith('--database=')) {
      databaseName = arg.slice('--database='.length);
      continue;
    }
    throw new Error(`Unknown argument: ${arg}`);
  }
  if (!databaseName?.trim()) throw new Error('An explicit --database <name> is required.');
  if (databaseName !== databaseName.trim() || databaseName.includes('/') || databaseName.includes('\\')) {
    throw new Error('The explicit database name is invalid.');
  }
  return { databaseName, apply };
}

export function assertTargetDatabase(actualDatabaseName, requestedDatabaseName) {
  if (!requestedDatabaseName) throw new Error('An explicit target database name is required.');
  if (!actualDatabaseName || actualDatabaseName !== requestedDatabaseName) {
    throw new Error('Connected database does not exactly match the explicitly requested database; refusing to continue.');
  }
}

export function getDatabaseNameFromUri(uri, { requireDatabasePath = true } = {}) {
  if (typeof uri !== 'string' || !uri.trim()) throw new Error('MONGODB_URI is required; connection details are withheld.');
  let parsed;
  try {
    parsed = new URL(uri);
  } catch {
    throw new Error('MONGODB_URI is invalid; connection details are withheld.');
  }
  if (!['mongodb:', 'mongodb+srv:'].includes(parsed.protocol)) throw new Error('MONGODB_URI must use MongoDB.');
  let name;
  try {
    name = decodeURIComponent(parsed.pathname.replace(/^\//, ''));
  } catch {
    throw new Error('MONGODB_URI must include a valid database path.');
  }
  if (!name && requireDatabasePath) throw new Error('MONGODB_URI must explicitly include a database path.');
  return name || null;
}

export function resolveTargetUri(uri, requestedDatabaseName, { apply = false } = {}) {
  const configuredDatabaseName = getDatabaseNameFromUri(uri, { requireDatabasePath: false });
  if (configuredDatabaseName) {
    assertTargetDatabase(configuredDatabaseName, requestedDatabaseName);
    return uri;
  }
  if (apply) {
    throw new Error('Apply mode requires MONGODB_URI to explicitly include the requested database path.');
  }
  if (requestedDatabaseName !== CONFIRMED_DEMO_DATABASE) {
    throw new Error(`A pathless MONGODB_URI is allowed only for the confirmed ${CONFIRMED_DEMO_DATABASE} demo dry run.`);
  }

  let parsed;
  try {
    parsed = new URL(uri);
  } catch {
    throw new Error('MONGODB_URI is invalid; connection details are withheld.');
  }
  parsed.pathname = `/${encodeURIComponent(requestedDatabaseName)}`;
  const resolvedUri = parsed.toString();
  assertTargetDatabase(getDatabaseNameFromUri(resolvedUri), requestedDatabaseName);
  return resolvedUri;
}

export function validateSeedProducts(products) {
  const errors = [];
  if (!Array.isArray(products) || products.length !== 20) {
    errors.push('Seed catalogue must contain exactly 20 products.');
    return errors;
  }

  const seen = new Set();
  for (const [index, product] of products.entries()) {
    const prefix = `Product ${index + 1}`;
    if (!product || typeof product !== 'object' || Array.isArray(product)) {
      errors.push(`${prefix} must be an object.`);
      continue;
    }
    if (typeof product.name !== 'string' || !product.name.trim() || product.name.trim().length > 200) errors.push(`${prefix} has an invalid name.`);
    if (typeof product.description !== 'string' || !product.description.trim()) errors.push(`${prefix} has no description.`);
    if (!CATEGORIES.includes(product.category)) errors.push(`${prefix} has an unsupported category.`);
    if (product.gender !== 'men') errors.push(`${prefix} must have gender men.`);

    if (!Number.isFinite(product.priceInr) || product.priceInr <= 0) errors.push(`${prefix} has an invalid regular price.`);
    if (product.discountPriceInr !== null
      && (!Number.isFinite(product.discountPriceInr) || product.discountPriceInr < 0 || product.discountPriceInr > product.priceInr)) {
      errors.push(`${prefix} has an invalid discount price.`);
    }
    if (!Array.isArray(product.images) || product.images.length === 0
      || product.images.some((image) => {
        if (typeof image !== 'string' || image.length > 2048) return true;
        try { return !['http:', 'https:'].includes(new URL(image).protocol); } catch { return true; }
      })) errors.push(`${prefix} must have valid HTTP(S) image URLs.`);
    if (!Array.isArray(product.sizes) || product.sizes.length === 0
      || product.sizes.some((size) => typeof size !== 'string' || !size.trim() || size.trim().length > 12)
      || (Array.isArray(product.sizes) && new Set(product.sizes.map((size) => String(size).trim())).size !== product.sizes.length)) {
      errors.push(`${prefix} must have unique, nonempty size labels.`);
    }
    if (!Number.isInteger(product.stock) || product.stock < 0) errors.push(`${prefix} must have nonnegative integer stock.`);
    if (product.shortDescription !== undefined && (typeof product.shortDescription !== 'string' || product.shortDescription.length > 300)) errors.push(`${prefix} has an invalid short description.`);
    if (product.colours !== undefined && (!Array.isArray(product.colours) || product.colours.some((colour) => !colour || typeof colour.name !== 'string' || !colour.name.trim() || (colour.hex !== undefined && !/^#[\da-f]{6}$/i.test(colour.hex))))) {
      errors.push(`${prefix} has invalid colour data.`);
    }
    if (typeof product.name === 'string' && product.name.trim() && ['men', 'women', 'unisex'].includes(product.gender)) {
      const key = identityKey(product);
      if (seen.has(key)) errors.push(`${prefix} duplicates a normalized name and gender.`);
      seen.add(key);
    }
  }

  for (const category of CATEGORIES) {
    const categoryCount = products.filter((product) => product?.category === category && product?.gender === 'men').length;
    if (categoryCount !== 5) errors.push(`${category} must contain exactly five men's products.`);
  }
  return errors;
}

export function toProductDocument(product) {
  const {
    priceInr,
    discountPriceInr,
    ...catalogFields
  } = product;
  return {
    ...catalogFields,
    slug: toSlug(product.name),
    price: priceInr / CATALOG_UNITS_PER_RUPEE,
    discountPrice: discountPriceInr === null ? null : discountPriceInr / CATALOG_UNITS_PER_RUPEE,
    gender: 'men',
    active: product.active !== false
  };
}

export function buildImportPlan(sourceProducts, existingProducts) {
  const errors = validateSeedProducts(sourceProducts);
  if (errors.length) throw new Error(`Seed validation failed:\n- ${errors.join('\n- ')}`);

  const existingByKey = new Map();
  for (const product of existingProducts) {
    if (typeof product?.name !== 'string' || typeof product?.gender !== 'string') continue;
    const key = identityKey(product);
    existingByKey.set(key, [...(existingByKey.get(key) || []), product]);
  }

  const alreadyPresent = [];
  const insertCandidates = [];
  for (const product of sourceProducts) {
    const key = identityKey(product);
    const matches = existingByKey.get(key) || [];
    if (matches.length > 1) throw new Error(`Database contains duplicate records for intended product "${product.name}"; no writes were made.`);
    if (matches.length === 1) alreadyPresent.push(product);
    else insertCandidates.push({ key, normalizedName: normalizeProductName(product.name), document: toProductDocument(product) });
  }
  return { sourceProducts, alreadyPresent, insertCandidates };
}

export function buildCategoryImportPlan(sourceCategories, existingCategories) {
  validateSeedCategories(sourceCategories);

  const existingBySlug = new Map();
  for (const category of existingCategories) {
    if (typeof category?.slug !== 'string') continue;
    existingBySlug.set(category.slug, [...(existingBySlug.get(category.slug) || []), category]);
  }

  const alreadyPresent = [];
  const insertCandidates = [];
  for (const category of sourceCategories) {
    const matches = existingBySlug.get(category.slug) || [];
    if (matches.length > 1) throw new Error(`Database contains duplicate categories for slug "${category.slug}"; no writes were made.`);
    if (matches.length === 1) {
      const existing = matches[0];
      if (existing.name !== category.name || existing.active === false) {
        throw new Error(`Existing category "${category.slug}" is not the required active "${category.name}" category; no writes were made.`);
      }
      alreadyPresent.push(category);
    } else {
      insertCandidates.push({
        slug: category.slug,
        document: { ...category, active: true }
      });
    }
  }
  return { alreadyPresent, insertCandidates };
}

const normalizedIdentityFilter = (normalizedName) => ({
  $expr: {
    $and: [
      { $eq: [{ $toLower: { $trim: { input: { $ifNull: ['$name', ''] } } } }, normalizedName] },
      { $eq: [{ $toLower: { $ifNull: ['$gender', ''] } }, 'men'] }
    ]
  }
});

const readCounts = async (collection) => {
  const [totalProducts, grouped] = await Promise.all([
    collection.countDocuments({}),
    collection.aggregate([
      { $group: { _id: { category: '$category', gender: '$gender' }, count: { $sum: 1 } } },
      { $sort: { '_id.category': 1, '_id.gender': 1 } }
    ]).toArray()
  ]);
  const allByCategory = Object.fromEntries(CATEGORIES.map((category) => [category, 0]));
  const menByCategory = Object.fromEntries(CATEGORIES.map((category) => [category, 0]));
  for (const row of grouped) {
    const category = row._id?.category;
    if (Object.hasOwn(allByCategory, category)) allByCategory[category] += row.count;
    if (row._id?.gender === 'men' && Object.hasOwn(menByCategory, category)) menByCategory[category] += row.count;
  }
  return { totalProducts, allByCategory, menByCategory };
};

export async function executeCatalogueImport({
  collection,
  categoryCollection,
  databaseName,
  targetDatabaseName,
  sourceProducts = productsData,
  sourceCategories = categoriesData,
  apply = false
}) {
  assertTargetDatabase(databaseName, targetDatabaseName);
  if (!categoryCollection) throw new Error('Categories collection is required.');
  const [existingProducts, existingCategories] = await Promise.all([
    collection.find({}, { projection: { name: 1, gender: 1 } }).toArray(),
    categoryCollection.find({ slug: { $in: sourceCategories.map(({ slug }) => slug) } }, { projection: { name: 1, slug: 1, active: 1 } }).toArray()
  ]);
  const categoryPlan = buildCategoryImportPlan(sourceCategories, existingCategories);
  const plan = buildImportPlan(sourceProducts, existingProducts);
  const before = await readCounts(collection);

  let inserted = 0;
  let insertedCategories = 0;
  if (apply) {
    for (const candidate of categoryPlan.insertCandidates) {
      const result = await categoryCollection.updateOne(
        { slug: candidate.slug },
        { $setOnInsert: candidate.document },
        { upsert: true }
      );
      if (result.upsertedCount === 1) insertedCategories += 1;
    }
    for (const candidate of plan.insertCandidates) {
      const result = await collection.updateOne(
        normalizedIdentityFilter(candidate.normalizedName),
        { $setOnInsert: candidate.document },
        { upsert: true }
      );
      if (result.upsertedCount === 1) inserted += 1;
    }
  }

  const after = apply ? await readCounts(collection) : {
    totalProducts: before.totalProducts + plan.insertCandidates.length,
    allByCategory: { ...before.allByCategory },
    menByCategory: { ...before.menByCategory }
  };
  if (!apply) {
    for (const product of plan.insertCandidates) {
      after.allByCategory[product.document.category] += 1;
      after.menByCategory[product.document.category] += 1;
    }
  }

  const alreadyPresent = apply ? 20 - inserted : plan.alreadyPresent.length;
  return {
    mode: apply ? 'apply' : 'dry-run',
    databaseName,
    expectedCategories: sourceCategories.length,
    currentCategories: categoryPlan.alreadyPresent.map(({ name, slug }) => ({ name, slug })),
    projectedCategoryInserts: categoryPlan.insertCandidates.length,
    insertedCategories,
    expectedProducts: sourceProducts.length,
    currentProductCount: before.totalProducts,
    currentCategoryCounts: before,
    projectedInserts: plan.insertCandidates.length,
    existingMatchingProducts: plan.alreadyPresent.map(({ name, gender }) => ({ name, gender })),
    inserted,
    alreadyPresent,
    before,
    after,
    postImportCountsAreProjected: !apply
  };
}

const acquireRunLock = (databaseName) => {
  const lockId = crypto.createHash('sha256').update(databaseName).digest('hex').slice(0, 20);
  const lockPath = path.join(os.tmpdir(), `xora-catalogue-import-${lockId}.lock`);
  let descriptor;
  try {
    descriptor = fs.openSync(lockPath, 'wx', 0o600);
    fs.writeFileSync(descriptor, `pid=${process.pid}\n`);
  } catch (error) {
    if (descriptor !== undefined) fs.closeSync(descriptor);
    if (error.code === 'EEXIST') throw new Error(`Another importer may be running. If not, confirm no importer is active before removing its lock file: ${lockPath}`);
    throw new Error('Could not acquire the local importer lock.');
  }
  return () => {
    try { fs.closeSync(descriptor); } finally { fs.unlinkSync(lockPath); }
  };
};

const runCli = async () => {
  const args = parseImporterArgs(process.argv.slice(2));
  const backendDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
  dotenv.config({ path: path.join(backendDirectory, '.env') });
  const uri = resolveTargetUri(process.env.MONGODB_URI, args.databaseName, { apply: args.apply });

  let releaseLock;
  try {
    if (args.apply) releaseLock = acquireRunLock(args.databaseName);
    const connection = await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
    assertTargetDatabase(connection.connection.name, args.databaseName);
    const report = await executeCatalogueImport({
      collection: connection.connection.collection('products'),
      categoryCollection: connection.connection.collection('categories'),
      databaseName: connection.connection.name,
      targetDatabaseName: args.databaseName,
      apply: args.apply
    });
    console.log(JSON.stringify(report, null, 2));
  } catch (error) {
    if (error.message.startsWith('Seed validation failed:') || error.message.startsWith('Database contains duplicate records') || error.message.startsWith('Connected database')) {
      console.error(error.message);
    } else {
      console.error('Catalogue import did not complete. Database error details and connection credentials are withheld.');
    }
    process.exitCode = 1;
  } finally {
    if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
    releaseLock?.();
  }
};

if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url) {
  runCli().catch(() => {
    console.error('Catalogue import could not start. Connection details are withheld.');
    process.exitCode = 1;
  });
}
