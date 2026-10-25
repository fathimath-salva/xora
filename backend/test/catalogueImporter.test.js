import test from 'node:test';
import assert from 'node:assert/strict';
import { productsData } from '../src/utils/seedData.js';
import {
  assertTargetDatabase,
  buildCategoryImportPlan,
  buildImportPlan,
  executeCatalogueImport,
  getDatabaseNameFromUri,
  normalizeProductName,
  resolveTargetUri,
  validateSeedProducts
} from '../src/utils/catalogueImporter.js';

const emptyCollection = () => ({
  writes: [],
  find: () => ({ toArray: async () => [] }),
  countDocuments: async () => 0,
  aggregate: () => ({ toArray: async () => [] }),
  updateOne: async function (...args) {
    this.writes.push(args);
    return { upsertedCount: 1 };
  }
});

const emptyCategoryCollection = () => ({
  writes: [],
  find: () => ({ toArray: async () => [] }),
  updateOne: async function (...args) {
    this.writes.push(args);
    return { upsertedCount: 1 };
  }
});

test('dry run reports the planned insertions and performs no writes', async () => {
  const collection = emptyCollection();
  const categoryCollection = emptyCategoryCollection();
  const report = await executeCatalogueImport({
    collection,
    categoryCollection,
    databaseName: 'xora_catalogue_test',
    targetDatabaseName: 'xora_catalogue_test'
  });
  assert.equal(report.mode, 'dry-run');
  assert.equal(report.inserted, 0);
  assert.equal(report.alreadyPresent, 0);
  assert.equal(report.after.totalProducts, 20);
  assert.equal(report.currentProductCount, 0);
  assert.deepEqual(report.currentCategoryCounts.menByCategory, {
    'T-Shirts': 0, Hoodies: 0, Shirts: 0, Trousers: 0
  });
  assert.equal(report.projectedInserts, 20);
  assert.equal(report.projectedCategoryInserts, 4);
  assert.deepEqual(report.existingMatchingProducts, []);
  assert.equal(report.postImportCountsAreProjected, true);
  assert.equal(collection.writes.length, 0);
  assert.equal(categoryCollection.writes.length, 0);
});

test('invalid seed data fails validation before any writes', async () => {
  const invalid = productsData.map((product, index) => index === 0 ? { ...product, stock: -1 } : product);
  assert.match(validateSeedProducts(invalid).join('\n'), /nonnegative integer stock/);
  const collection = emptyCollection();
  const categoryCollection = emptyCategoryCollection();
  await assert.rejects(executeCatalogueImport({
    collection,
    categoryCollection,
    databaseName: 'xora_catalogue_test',
    targetDatabaseName: 'xora_catalogue_test',
    sourceProducts: invalid,
    apply: true
  }), /Seed validation failed/);
  assert.equal(collection.writes.length, 0);
});

test('insert-only upserts are idempotent for repeated normalized identities', async () => {
  const store = new Map();
  const categoryStore = new Map();
  const collection = {
    find: () => ({ toArray: async () => [...store.values()].map(({ name, gender }) => ({ name, gender })) }),
    countDocuments: async () => store.size,
    aggregate: () => ({ toArray: async () => [] }),
    updateOne: async (_filter, update) => {
      const document = update.$setOnInsert;
      const key = `${normalizeProductName(document.name)}|${document.gender}`;
      if (store.has(key)) return { matchedCount: 1, upsertedCount: 0 };
      store.set(key, document);
      return { matchedCount: 0, upsertedCount: 1 };
    }
  };
  const categoryCollection = {
    find: () => ({ toArray: async () => [...categoryStore.values()] }),
    updateOne: async (_filter, update) => {
      const document = update.$setOnInsert;
      if (categoryStore.has(document.slug)) return { matchedCount: 1, upsertedCount: 0 };
      categoryStore.set(document.slug, document);
      return { matchedCount: 0, upsertedCount: 1 };
    }
  };
  const options = { collection, categoryCollection, databaseName: 'xora_catalogue_test', targetDatabaseName: 'xora_catalogue_test', apply: true };
  const first = await executeCatalogueImport(options);
  const second = await executeCatalogueImport(options);
  assert.equal(first.inserted, 20);
  assert.equal(first.alreadyPresent, 0);
  assert.equal(second.inserted, 0);
  assert.equal(second.alreadyPresent, 20);
  assert.equal(store.size, 20);
  assert.equal(categoryStore.size, 4);
});

test('refuses a requested database that does not exactly match the connected database', () => {
  assert.throws(() => assertTargetDatabase('xora_ecommerce', 'test'), /does not exactly match/);
  assert.throws(() => assertTargetDatabase('xora_ecommerce', ''), /explicit target/);
});

test('wrong database is rejected before reading or writing its Products collection', async () => {
  let reads = 0;
  let writes = 0;
  const collection = {
    find: () => { reads += 1; return { toArray: async () => [] }; },
    countDocuments: async () => 0,
    aggregate: () => ({ toArray: async () => [] }),
    updateOne: async () => { writes += 1; return { upsertedCount: 1 }; }
  };
  const categoryCollection = emptyCategoryCollection();
  await assert.rejects(executeCatalogueImport({
    collection,
    categoryCollection,
    databaseName: 'xora_ecommerce',
    targetDatabaseName: 'test',
    apply: true
  }), /does not exactly match/);
  assert.equal(reads, 0);
  assert.equal(writes, 0);
});

test('requires an explicit database path when extracting the database name', () => {
  assert.equal(getDatabaseNameFromUri('mongodb://127.0.0.1:27017/xora_ecommerce?authSource=admin'), 'xora_ecommerce');
  assert.throws(() => getDatabaseNameFromUri('mongodb://127.0.0.1:27017/?appName=xora'), /explicitly include a database/);
});

test('resolves a pathless URI to the confirmed test database for dry runs only', () => {
  const resolved = resolveTargetUri('mongodb+srv://user:password@example.mongodb.net/?appName=xora-cluster', 'test');
  assert.equal(getDatabaseNameFromUri(resolved), 'test');
  const parsed = new URL(resolved);
  assert.equal(parsed.host, 'example.mongodb.net');
  assert.equal(parsed.searchParams.get('appName'), 'xora-cluster');
});

test('rejects pathless URIs for other targets and for apply mode', () => {
  const pathlessUri = 'mongodb+srv://user:password@example.mongodb.net/?appName=xora-cluster';
  assert.throws(() => resolveTargetUri(pathlessUri, 'xora_ecommerce'), /confirmed test demo dry run/);
  assert.throws(() => resolveTargetUri(pathlessUri, 'test', { apply: true }), /Apply mode requires/);
  assert.throws(() => resolveTargetUri('mongodb://127.0.0.1:27017/xora_ecommerce', 'test'), /does not exactly match/);
});

test('seed validation confirms the intended 5 by 4 catalogue', () => {
  assert.deepEqual(validateSeedProducts(productsData), []);
  const plan = buildImportPlan(productsData, [{ name: productsData[0].name.toUpperCase(), gender: 'men' }]);
  assert.equal(plan.alreadyPresent.length, 1);
  assert.equal(plan.insertCandidates.length, 19);
});

test('category preflight inserts only missing required active categories', () => {
  const plan = buildCategoryImportPlan([
    { name: 'T-Shirts', slug: 't-shirts', gender: 'men' },
    { name: 'Hoodies', slug: 'hoodies', gender: 'men' },
    { name: 'Shirts', slug: 'shirts', gender: 'men' },
    { name: 'Trousers', slug: 'trousers', gender: 'men' }
  ], [{ name: 'T-Shirts', slug: 't-shirts', active: true }]);
  assert.equal(plan.alreadyPresent.length, 1);
  assert.equal(plan.insertCandidates.length, 3);
});

test('category preflight refuses inactive or mismatched categories before writes', () => {
  assert.throws(() => buildCategoryImportPlan([
    { name: 'T-Shirts', slug: 't-shirts', gender: 'men' },
    { name: 'Hoodies', slug: 'hoodies', gender: 'men' },
    { name: 'Shirts', slug: 'shirts', gender: 'men' },
    { name: 'Trousers', slug: 'trousers', gender: 'men' }
  ], [{ name: 'T-Shirts', slug: 't-shirts', active: false }]), /not the required active/);
});
