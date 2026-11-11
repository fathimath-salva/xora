import mongoose from 'mongoose';

const { MongoClient } = mongoose.mongo;

const EXPECTED_DATABASE = 'test';

const normalizeSeedHosts = (hosts, label) => {
  const entries = Array.isArray(hosts) ? hosts : String(hosts || '').split(',');
  if (!entries.length || entries.some((host) => !String(host).trim())) {
    throw new Error(`${label} must contain one or more exact MongoDB seed hosts.`);
  }

  const normalized = entries.map((entry) => {
    const host = String(entry).trim().toLowerCase();
    const match = host.match(/^(?:([a-z0-9.-]+)|(\[[0-9a-f:.]+\]))(?::(\d{1,5}))?$/i);
    if (!match) throw new Error(`${label} may contain hostnames and optional ports only.`);
    const port = match[3] === undefined ? 27017 : Number(match[3]);
    if (port < 1 || port > 65535) throw new Error(`${label} contains an invalid port.`);
    return `${match[1] || match[2]}:${port}`;
  });

  if (new Set(normalized).size !== normalized.length) throw new Error(`${label} must not contain duplicate hosts.`);
  return normalized.sort();
};

export async function inspectMongoUri(uri) {
  const client = new MongoClient(uri);
  const target = {
    databaseName: client.options.dbName,
    hosts: mongoSeedHosts(client)
  };
  await client.close();
  return target;
}

export function mongoSeedHosts(client) {
  if (client.options.srvHost) return [client.options.srvHost];
  return client.options.hosts.map((host) => host.toString());
}

export function validateDummyCatalogTarget({
  nodeEnvironment,
  databaseName,
  confirmation,
  enabled,
  requireOptIn = true,
  expectedHosts,
  actualHosts
}) {
  if (nodeEnvironment !== 'development') throw new Error('Dummy catalogue operations require NODE_ENV=development.');
  if (databaseName !== EXPECTED_DATABASE) throw new Error(`Dummy catalogue operations require database "${EXPECTED_DATABASE}".`);
  if (confirmation !== EXPECTED_DATABASE) throw new Error(`Pass --confirm-staging-database=${EXPECTED_DATABASE} to continue.`);
  if (requireOptIn && enabled !== true) throw new Error('Set DUMMY_CATALOG_SEED_ENABLED=true in the local environment to continue.');

  const expected = normalizeSeedHosts(expectedHosts, 'DUMMY_CATALOG_EXPECTED_MONGODB_HOSTS');
  const actual = normalizeSeedHosts(actualHosts, 'MongoDB URI seed hosts');
  if (expected.length !== actual.length || expected.some((host, index) => host !== actual[index])) {
    throw new Error('Configured MongoDB seed hosts do not exactly match the local staging allowlist.');
  }
}

const assertNoCategoryOrCollectionCollisions = (existing, proposed, label) => {
  const bySlug = new Map(proposed.map((record) => [record.slug, record]));
  const byName = new Map(proposed.map((record) => [record.name, record]));
  for (const record of existing) {
    const expected = bySlug.get(record.slug) || byName.get(record.name);
    if (!expected || expected.slug !== record.slug || expected.name !== record.name) {
      throw new Error(`${label} identity collision for "${record.slug || record.name}". No catalogue data was written.`);
    }
  }
};

const assertNoProductSlugCollisions = (existing, proposed) => {
  const bySlug = new Map(proposed.map((product) => [product.slug, product]));
  for (const current of existing) {
    const expected = bySlug.get(current.slug);
    if (!expected ||
        current.name !== expected.name ||
        current.category !== expected.category ||
        current.collectionName !== expected.collectionName) {
      throw new Error(`Dummy product slug collision for "${current.slug}". No catalogue data was written.`);
    }
  }
};

const findExisting = (Model, filter, projection) => Model.find(filter).select(projection).lean();

const upsertInsertOnly = async (Model, key, document) => {
  const result = await Model.updateOne(key, { $setOnInsert: document }, { upsert: true });
  return result.upsertedCount === 1;
};

const upsertAllInsertOnly = async (Model, records, getKey) => {
  let inserted = 0;
  for (const record of records) {
    if (await upsertInsertOnly(Model, getKey(record), record)) inserted += 1;
  }
  return { inserted, alreadyPresent: records.length - inserted };
};

export async function seedDummyCatalog({
  target,
  Category,
  Collection,
  Product,
  categories,
  collections,
  products,
  dryRun = false
}) {
  validateDummyCatalogTarget({ ...target, requireOptIn: !dryRun });

  const categoryNames = categories.map((record) => record.name);
  const categorySlugs = categories.map((record) => record.slug);
  const collectionNames = collections.map((record) => record.name);
  const collectionSlugs = collections.map((record) => record.slug);
  const productSlugs = products.map((record) => record.slug);

  const [existingCategories, existingCollections, existingProducts] = await Promise.all([
    findExisting(Category, { $or: [{ slug: { $in: categorySlugs } }, { name: { $in: categoryNames } }] }, 'slug name'),
    findExisting(Collection, { $or: [{ slug: { $in: collectionSlugs } }, { name: { $in: collectionNames } }] }, 'slug name'),
    findExisting(Product, { slug: { $in: productSlugs } }, 'slug name category collectionName')
  ]);

  assertNoCategoryOrCollectionCollisions(existingCategories, categories, 'Category');
  assertNoCategoryOrCollectionCollisions(existingCollections, collections, 'Collection');
  assertNoProductSlugCollisions(existingProducts, products);

  if (dryRun) {
    return {
      categories: { inserted: categories.length - existingCategories.length, alreadyPresent: existingCategories.length },
      collections: { inserted: collections.length - existingCollections.length, alreadyPresent: existingCollections.length },
      products: { inserted: products.length - existingProducts.length, alreadyPresent: existingProducts.length }
    };
  }

  const categorySummary = await upsertAllInsertOnly(Category, categories, ({ slug }) => ({ slug }));
  const collectionSummary = await upsertAllInsertOnly(Collection, collections, ({ slug }) => ({ slug }));
  const productSummary = await upsertAllInsertOnly(Product, products, ({ slug }) => ({ slug }));
  return { categories: categorySummary, collections: collectionSummary, products: productSummary };
}
