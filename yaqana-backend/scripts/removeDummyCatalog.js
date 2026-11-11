import mongoose from 'mongoose';
import { env } from '../src/config/env.js';
import { connectDatabase, disconnectDatabase } from '../src/config/database.js';
import Cart from '../src/models/Cart.js';
import Collection from '../src/models/Collection.js';
import Order from '../src/models/Order.js';
import Product from '../src/models/Product.js';
import Wishlist from '../src/models/Wishlist.js';
import { inspectMongoUri, mongoSeedHosts, validateDummyCatalogTarget } from '../src/utils/dummyCatalogSeed.js';

const sampleCollections = [
  'DEV SAMPLE — Everyday Essentials',
  'DEV SAMPLE — Modern Tailoring',
  'DEV SAMPLE — Weekend Layers'
];
const confirmationArgs = process.argv.filter((argument) => argument.startsWith('--confirm-staging-database='));
const confirmation = confirmationArgs.length === 1 ? confirmationArgs[0].slice('--confirm-staging-database='.length) : undefined;
const apply = process.argv.includes('--apply');
const expectedHosts = process.env.DUMMY_CATALOG_EXPECTED_MONGODB_HOSTS;
const uriTarget = await inspectMongoUri(env.MONGODB_URI);
const target = {
  nodeEnvironment: env.NODE_ENV,
  databaseName: uriTarget.databaseName,
  confirmation,
  enabled: false,
  requireOptIn: false,
  expectedHosts,
  actualHosts: uriTarget.hosts
};

validateDummyCatalogTarget(target);
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
  validateDummyCatalogTarget(connectedTarget);
  process.stdout.write(`${apply ? 'Applying' : 'Dry-run'} on verified NODE_ENV=${env.NODE_ENV} database=${connection.name} hostAllowlist=match topology=${topologyType}.\n`);

  const products = await Product.find({
    slug: /^dev-dummy-/,
    collectionName: { $in: sampleCollections }
  }).select('_id slug collectionName active').lean();
  const productActions = [];

  for (const product of products) {
    const references = await Promise.all([
      Cart.exists({ 'items.product': product._id }),
      Wishlist.exists({ products: product._id }),
      Order.exists({ 'items.product': product._id })
    ]);
    const sources = ['cart', 'wishlist', 'order'].filter((_source, index) => references[index]);
    const action = sources.length ? 'archive' : 'delete';
    productActions.push({ slug: product.slug, action, references: sources });

    if (apply && action === 'archive') {
      await Product.updateOne(
        { _id: product._id, slug: product.slug, collectionName: { $in: sampleCollections } },
        { $set: { active: false } }
      );
    } else if (apply) {
      await Product.deleteOne({ _id: product._id, slug: product.slug, collectionName: { $in: sampleCollections } });
    }
  }

  const collections = await Collection.find({ name: { $in: sampleCollections } }).select('_id name slug').lean();
  const collectionActions = [];
  for (const collection of collections) {
    const inUse = await Product.exists({ collectionName: collection.name });
    const action = inUse ? 'keep-in-use' : 'remove-empty';
    collectionActions.push({ name: collection.name, action });
    if (apply && !inUse) {
      await Collection.deleteOne({ _id: collection._id, name: collection.name, slug: collection.slug });
    }
  }

  process.stdout.write(`${JSON.stringify({ products: productActions, collections: collectionActions }, null, 2)}\n`);
  if (!apply) process.stdout.write('No records were modified. Pass --apply with the same database confirmation to apply this cleanup.\n');
} finally {
  await disconnectDatabase();
}
