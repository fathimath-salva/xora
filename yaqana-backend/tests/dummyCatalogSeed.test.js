import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const backendRoot = fileURLToPath(new URL('..', import.meta.url));
const dataPath = path.join(backendRoot, 'data', 'dev-products.json');
const helperPath = new URL('../src/utils/dummyCatalogSeed.js', import.meta.url);
const expectedPrices = {
  'dev-dummy-essential-heavyweight-crewneck': [159900, 139900],
  'dev-dummy-compact-cotton-box-tee': [179900, 159900],
  'dev-dummy-washed-jersey-tee': [189900, 169900],
  'dev-dummy-textured-slub-tee': [169900, 149900],
  'dev-dummy-oxford-button-down': [289900, 249900],
  'dev-dummy-linen-blend-resort-shirt': [319900, 279900],
  'dev-dummy-micro-check-cotton-shirt': [279900, 249900],
  'dev-dummy-chambray-overshirt': [329900, 289900],
  'dev-dummy-tapered-cotton-chino': [299900, 259900],
  'dev-dummy-relaxed-pleated-trouser': [349900, 309900],
  'dev-dummy-linen-blend-drawstring-trouser': [279900, 239900],
  'dev-dummy-straight-leg-tailored-trouser': [329900, 289900],
  'dev-dummy-indigo-straight-jean': [329900, 289900],
  'dev-dummy-mid-wash-tapered-jean': [349900, 309900],
  'dev-dummy-charcoal-straight-jean': [359900, 319900],
  'dev-dummy-ecru-relaxed-jean': [379900, 339900],
  'dev-dummy-brushed-fleece-pullover': [349900, 309900],
  'dev-dummy-zip-front-fleece-hoodie': [399900, 359900],
  'dev-dummy-french-terry-relaxed-hoodie': [329900, 289900],
  'dev-dummy-heavyweight-tonal-hoodie': [429900, 379900],
  'dev-dummy-cotton-twill-utility-jacket': [549900, 489900],
  'dev-dummy-lightweight-harrington-jacket': [599900, 529900],
  'dev-dummy-denim-trucker-jacket': [649900, 579900],
  'dev-dummy-quilted-liner-jacket': [699900, 629900]
};
const expectedCollections = [
  'DEV SAMPLE — Everyday Essentials',
  'DEV SAMPLE — Modern Tailoring',
  'DEV SAMPLE — Weekend Layers'
];
const approvedTarget = {
  nodeEnvironment: 'development',
  databaseName: 'test',
  confirmation: 'test',
  enabled: true,
  expectedHosts: 'stage-b.example:27017,stage-a.example:27017',
  actualHosts: ['stage-a.example:27017', 'stage-b.example:27017']
};
const matchesFilter = (record, filter) => {
  if (filter.$or) return filter.$or.some((condition) => matchesFilter(record, condition));
  return Object.entries(filter).every(([key, condition]) => {
    if (condition && Array.isArray(condition.$in)) return condition.$in.includes(record[key]);
    return record[key] === condition;
  });
};
const createMemoryModel = () => {
  const records = [];
  let writeCount = 0;
  return {
    records,
    get writeCount() { return writeCount; },
    find: (filter) => ({
      select: (projection) => ({
        lean: async () => {
          const fields = projection.split(' ');
          return records.filter((record) => matchesFilter(record, filter))
            .map((record) => Object.fromEntries(fields.map((field) => [field, record[field]])));
        }
      })
    }),
    updateOne: async (filter, update, options) => {
      writeCount += 1;
      assert.deepEqual(Object.keys(update), ['$setOnInsert']);
      assert.equal(options.upsert, true);
      if (records.some((record) => matchesFilter(record, filter))) return { upsertedCount: 0 };
      records.push(structuredClone(update.$setOnInsert));
      return { upsertedCount: 1 };
    }
  };
};

test('dummy product data covers the approved 24 products and schema with exact paise prices', () => {
  assert.ok(existsSync(dataPath), 'dummy product data must exist');
  const products = JSON.parse(readFileSync(dataPath, 'utf8'));
  const manifestPath = path.resolve(backendRoot, '..', 'frontend', 'public', 'images', 'dev-products', 'manifest.json');
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  const imageBySlug = new Map(manifest.map((image) => [image.productSlug, image.publicPath]));
  const categories = new Set(products.map((product) => product.category));

  assert.equal(products.length, 24);
  assert.deepEqual([...categories].sort(), ['Hoodies', 'Jackets', 'Jeans', 'Shirts', 'T-Shirts', 'Trousers'].sort());
  assert.deepEqual([...new Set(products.map((product) => product.collectionName))].sort(), [...expectedCollections].sort());

  const slugs = new Set();
  for (const product of products) {
    assert.match(product.slug, /^dev-dummy-/);
    assert.equal(slugs.has(product.slug), false);
    slugs.add(product.slug);
    assert.deepEqual([product.pricePaise, product.discountPricePaise], expectedPrices[product.slug]);
    assert.ok(Number.isSafeInteger(product.pricePaise) && product.pricePaise > 0);
    assert.ok(Number.isSafeInteger(product.discountPricePaise) && product.discountPricePaise > 0);
    assert.ok(product.discountPricePaise < product.pricePaise);
    assert.equal(product.gender, 'men');
    assert.equal(product.active, true);
    assert.ok(Number.isInteger(product.stock) && product.stock > 0);
    assert.ok(product.description.toLowerCase().includes('development sample'));
    assert.ok(product.shortDescription);
    assert.ok(product.fabricDetails);
    assert.ok(product.fitDetails);
    assert.ok(product.careInstructions);
    assert.ok(product.shippingDetails);
    assert.ok(Array.isArray(product.sizes) && product.sizes.length > 0);
    assert.ok(Array.isArray(product.colours) && product.colours.length > 0);
    assert.ok(product.colours.every((colour) => /^#[0-9a-f]{6}$/i.test(colour.hex)));
    assert.ok(Array.isArray(product.images) && product.images.length === 1);
    assert.equal(product.images[0], imageBySlug.get(product.slug));
    assert.ok(product.measurements && typeof product.measurements === 'object');
  }
});

test('target validation requires the exact staging environment, database, opt-in, and host set', async () => {
  assert.ok(existsSync(fileURLToPath(helperPath)), 'target-validation helper must exist');
  const { inspectMongoUri, validateDummyCatalogTarget } = await import(helperPath.href);

  assert.doesNotThrow(() => validateDummyCatalogTarget(approvedTarget));
  const parsedTarget = await inspectMongoUri('mongodb://demo:secret@stage.example:27017/test?replicaSet=rs0');
  assert.deepEqual(parsedTarget, { databaseName: 'test', hosts: ['stage.example:27017'] });
  const parsedSrvTarget = await inspectMongoUri('mongodb+srv://demo:secret@cluster.example/test');
  assert.deepEqual(parsedSrvTarget, { databaseName: 'test', hosts: ['cluster.example'] });

  for (const override of [
    { nodeEnvironment: 'production' },
    { databaseName: 'production' },
    { confirmation: 'other' },
    { enabled: false },
    { expectedHosts: '' },
    { expectedHosts: 'stage-a.example:27017' },
    { expectedHosts: 'user:pass@stage-a.example:27017' },
    { actualHosts: [] }
  ]) {
    assert.throws(
      () => validateDummyCatalogTarget({ ...approvedTarget, ...override }),
      Error,
      `target must be rejected for ${JSON.stringify(override)}`
    );
  }
});

test('repeat seeding uses insert-only upserts and preserves existing dummy records', async () => {
  assert.ok(existsSync(fileURLToPath(helperPath)), 'seeding helper must exist');
  const { seedDummyCatalog } = await import(helperPath.href);
  const products = JSON.parse(readFileSync(dataPath, 'utf8'));
  const categories = [
    { name: 'Jeans', slug: 'jeans', image: '/images/dev-products/dev-dummy-indigo-straight-jean.jpg', gender: 'men', active: true },
    { name: 'Jackets', slug: 'jackets', image: '/images/dev-products/dev-dummy-cotton-twill-utility-jacket.jpg', gender: 'men', active: true }
  ];
  const collections = expectedCollections.map((name, index) => ({
    name,
    slug: ['dev-sample-everyday-essentials', 'dev-sample-modern-tailoring', 'dev-sample-weekend-layers'][index],
    description: 'Development sample collection; product content is illustrative.',
    active: true
  }));
  const models = { Category: createMemoryModel(), Collection: createMemoryModel(), Product: createMemoryModel() };
  const firstRun = await seedDummyCatalog({ target: approvedTarget, ...models, categories, collections, products });

  assert.deepEqual(firstRun, {
    categories: { inserted: 2, alreadyPresent: 0 },
    collections: { inserted: 3, alreadyPresent: 0 },
    products: { inserted: 24, alreadyPresent: 0 }
  });

  models.Category.records[0].image = '/images/genuine-category.jpg';
  models.Product.records[0].pricePaise = 123456;
  const secondRun = await seedDummyCatalog({ target: approvedTarget, ...models, categories, collections, products });

  assert.deepEqual(secondRun, {
    categories: { inserted: 0, alreadyPresent: 2 },
    collections: { inserted: 0, alreadyPresent: 3 },
    products: { inserted: 0, alreadyPresent: 24 }
  });
  assert.equal(models.Category.records[0].image, '/images/genuine-category.jpg');
  assert.equal(models.Product.records[0].pricePaise, 123456);
  assert.equal(models.Category.records.length, 2);
  assert.equal(models.Collection.records.length, 3);
  assert.equal(models.Product.records.length, 24);
});

test('seed dry-run reports planned inserts without writing', async () => {
  assert.ok(existsSync(fileURLToPath(helperPath)), 'seeding helper must exist');
  const { seedDummyCatalog } = await import(helperPath.href);
  const products = JSON.parse(readFileSync(dataPath, 'utf8'));
  const categories = [{ name: 'Jeans', slug: 'jeans' }, { name: 'Jackets', slug: 'jackets' }];
  const collections = expectedCollections.map((name, index) => ({
    name,
    slug: ['dev-sample-everyday-essentials', 'dev-sample-modern-tailoring', 'dev-sample-weekend-layers'][index]
  }));
  const models = { Category: createMemoryModel(), Collection: createMemoryModel(), Product: createMemoryModel() };
  const dryRunTarget = { ...approvedTarget, enabled: false };
  const result = await seedDummyCatalog({ target: dryRunTarget, ...models, categories, collections, products, dryRun: true });

  assert.deepEqual(result, {
    categories: { inserted: 2, alreadyPresent: 0 },
    collections: { inserted: 3, alreadyPresent: 0 },
    products: { inserted: 24, alreadyPresent: 0 }
  });
  assert.equal(models.Category.records.length + models.Collection.records.length + models.Product.records.length, 0);
  assert.equal(models.Category.writeCount + models.Collection.writeCount + models.Product.writeCount, 0);

  for (const override of [
    { actualHosts: ['production.example:27017'] },
    { databaseName: 'production' },
    { nodeEnvironment: 'production' }
  ]) {
    await assert.rejects(
      seedDummyCatalog({
        target: { ...dryRunTarget, ...override },
        ...models,
        categories,
        collections,
        products,
        dryRun: true
      })
    );
  }
  assert.equal(models.Category.records.length + models.Collection.records.length + models.Product.records.length, 0);
  assert.equal(models.Category.writeCount + models.Collection.writeCount + models.Product.writeCount, 0);
});

test('actual seeding rejects disabled opt-in before writing', async () => {
  assert.ok(existsSync(fileURLToPath(helperPath)), 'seeding helper must exist');
  const { seedDummyCatalog } = await import(helperPath.href);
  let writeCount = 0;
  const model = {
    find: () => ({ select: () => ({ lean: async () => [] }) }),
    updateOne: async () => { writeCount += 1; return { upsertedCount: 1 }; }
  };

  await assert.rejects(
    seedDummyCatalog({
      target: { ...approvedTarget, enabled: false },
      Category: model,
      Collection: model,
      Product: model,
      categories: [{ name: 'Jeans', slug: 'jeans' }],
      collections: [{ name: expectedCollections[0], slug: 'dev-sample-everyday-essentials' }],
      products: [{ slug: 'dev-dummy-test-product' }]
    }),
    /DUMMY_CATALOG_SEED_ENABLED=true/
  );
  assert.equal(writeCount, 0);
});

test('a same-slug record with genuine identity aborts before any insert-only write', async () => {
  assert.ok(existsSync(fileURLToPath(helperPath)), 'seeding helper must exist');
  const { seedDummyCatalog } = await import(helperPath.href);
  let writeCount = 0;
  const emptyModel = {
    find: () => ({ select: () => ({ lean: async () => [] }) }),
    updateOne: async () => { writeCount += 1; return { upsertedCount: 1 }; }
  };
  const collisionModel = {
    find: () => ({
      select: () => ({
        lean: async () => [{
          slug: 'dev-dummy-cotton-twill-utility-jacket',
          name: 'Genuine Utility Jacket',
          category: 'Jackets',
          collectionName: 'Genuine Collection'
        }]
      })
    }),
    updateOne: async () => { writeCount += 1; return { upsertedCount: 1 }; }
  };

  await assert.rejects(
    seedDummyCatalog({
      target: {
        nodeEnvironment: 'development',
        databaseName: 'test',
        confirmation: 'test',
        enabled: true,
        expectedHosts: 'stage-a.example:27017',
        actualHosts: ['stage-a.example:27017']
      },
      Category: emptyModel,
      Collection: emptyModel,
      Product: collisionModel,
      categories: [{ name: 'Jeans', slug: 'jeans' }, { name: 'Jackets', slug: 'jackets' }],
      collections: expectedCollections.map((name) => ({ name, slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-') })),
      products: [{
        slug: 'dev-dummy-cotton-twill-utility-jacket',
        name: 'Cotton-Twill Utility Jacket',
        category: 'Jackets',
        collectionName: expectedCollections[2]
      }]
    }),
    /slug collision/i
  );
  assert.equal(writeCount, 0);
});
