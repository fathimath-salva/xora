import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import mongoose from 'mongoose';
import { env } from '../src/config/env.js';
import { connectDatabase, disconnectDatabase } from '../src/config/database.js';
import Category from '../src/models/Category.js';
import Collection from '../src/models/Collection.js';
import Product from '../src/models/Product.js';
import { inspectMongoUri, mongoSeedHosts, seedDummyCatalog, validateDummyCatalogTarget } from '../src/utils/dummyCatalogSeed.js';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const backendDirectory = path.resolve(scriptDirectory, '..');
const workspaceDirectory = path.resolve(backendDirectory, '..');
const products = JSON.parse(readFileSync(path.join(backendDirectory, 'data', 'dev-products.json'), 'utf8'));
const imageManifestPath = path.join(workspaceDirectory, 'frontend', 'public', 'images', 'dev-products', 'manifest.json');
const imageDirectory = path.dirname(imageManifestPath);
const imageManifest = JSON.parse(readFileSync(imageManifestPath, 'utf8'));
const categoryRecords = [
  {
    name: 'Jeans',
    slug: 'jeans',
    image: '/images/dev-products/dev-dummy-indigo-straight-jean.jpg',
    gender: 'men',
    active: true
  },
  {
    name: 'Jackets',
    slug: 'jackets',
    image: '/images/dev-products/dev-dummy-cotton-twill-utility-jacket.jpg',
    gender: 'men',
    active: true
  }
];
const collectionRecords = [
  {
    name: 'DEV SAMPLE — Everyday Essentials',
    slug: 'dev-sample-everyday-essentials',
    description: 'Development sample collection; product content is illustrative.',
    active: true
  },
  {
    name: 'DEV SAMPLE — Modern Tailoring',
    slug: 'dev-sample-modern-tailoring',
    description: 'Development sample collection; product content is illustrative.',
    active: true
  },
  {
    name: 'DEV SAMPLE — Weekend Layers',
    slug: 'dev-sample-weekend-layers',
    description: 'Development sample collection; product content is illustrative.',
    active: true
  }
];

const validateImageManifest = () => {
  if (products.length !== 24 || imageManifest.length !== 24) {
    throw new Error('The seed requires exactly 24 products and 24 image-manifest entries.');
  }

  const manifestBySlug = new Map(imageManifest.map((entry) => [entry.productSlug, entry]));
  if (manifestBySlug.size !== imageManifest.length) throw new Error('The image manifest contains duplicate product slugs.');
  for (const product of products) {
    const image = manifestBySlug.get(product.slug);
    if (!image || product.images.length !== 1 || image.publicPath !== product.images[0]) {
      throw new Error(`The image manifest does not match product "${product.slug}".`);
    }
    const bytes = readFileSync(path.join(imageDirectory, image.file));
    const digest = createHash('sha256').update(bytes).digest('hex');
    if (digest !== image.sha256) throw new Error(`The local image hash does not match the manifest for "${product.slug}".`);
  }
};

const confirmationArgs = process.argv.filter((argument) => argument.startsWith('--confirm-staging-database='));
const confirmation = confirmationArgs.length === 1 ? confirmationArgs[0].slice('--confirm-staging-database='.length) : undefined;
const dryRun = process.argv.includes('--dry-run');
const enabled = process.env.DUMMY_CATALOG_SEED_ENABLED === 'true';
const expectedHosts = process.env.DUMMY_CATALOG_EXPECTED_MONGODB_HOSTS;
const uriTarget = await inspectMongoUri(env.MONGODB_URI);
const target = {
  nodeEnvironment: env.NODE_ENV,
  databaseName: uriTarget.databaseName,
  confirmation,
  enabled,
  expectedHosts,
  actualHosts: uriTarget.hosts
};

validateImageManifest();
validateDummyCatalogTarget({ ...target, requireOptIn: !dryRun });
await connectDatabase();

try {
  const connection = mongoose.connection;
  const client = connection.getClient();
  const topologyType = client.topology?.description?.type;
  if (!topologyType) throw new Error('Could not verify the connected MongoDB topology.');

  const connectedTarget = {
    ...target,
    databaseName: connection.name,
    actualHosts: mongoSeedHosts(client)
  };
  validateDummyCatalogTarget({ ...connectedTarget, requireOptIn: !dryRun });
  process.stdout.write(`Verified NODE_ENV=${env.NODE_ENV} database=${connection.name} hostAllowlist=match topology=${topologyType}.\n`);

  const summary = await seedDummyCatalog({
    target: connectedTarget,
    Category,
    Collection,
    Product,
    categories: categoryRecords,
    collections: collectionRecords,
    products,
    dryRun
  });
  process.stdout.write(`${dryRun ? 'Dry-run' : 'Seed'} summary: ${JSON.stringify(summary)}\n`);
} finally {
  await disconnectDatabase();
}
