import mongoose from 'mongoose';
import Product from '../models/Product.js';
import Category from '../models/Category.js';
import Collection from '../models/Collection.js';
import { asyncHandler, httpError, slugify } from '../utils/http.js';
import { catalogUnitsToPaise } from '../utils/money.js';
import { buildEffectivePriceFilter } from '../utils/effectivePriceFilter.js';

const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const isAdmin = (req) => req.user?.role === 'admin';
const requiredCategorySlugs = new Set(['t-shirts', 'hoodies', 'shirts', 'trousers']);
const parseList = (value, label, max = 30) => {
  if (value == null || value === '') return [];
  const list = typeof value === 'string' ? value.split(',') : value;
  if (!Array.isArray(list) || list.length > max || list.some((v) => typeof v !== 'string' || !v.trim() || v.length > 100)) throw httpError(400, `${label} must be a valid list.`);
  return [...new Set(list.map((v) => v.trim()))];
};
const parseMoneyPaise = (value, label, optional = false) => {
  if ((value === undefined || value === null || value === '') && optional) return null;
  const number = Number(value);
  if (!Number.isFinite(number) || number < 0 || number > 100000000) throw httpError(400, `${label} must be a non-negative amount.`);
  return catalogUnitsToPaise(number);
};
const parseImages = (value) => {
  const images = parseList(value, 'Images', 30);
  if (!images.length || images.some((url) => url.length > 2048 || !(url.startsWith('https://') || url.startsWith('http://') || url.startsWith('/uploads/') || url.startsWith('/images/')))) throw httpError(400, 'Provide at least one valid product image URL.');
  return images;
};
const parseColours = (value) => {
  if (typeof value === 'string') return value.split(',').map((name) => ({ name: name.trim(), hex: '#D4C5B9' })).filter((x) => x.name);
  if (value == null) return [];
  if (!Array.isArray(value) || value.length > 30) throw httpError(400, 'Colours must be a valid list.');
  return value.map((colour) => {
    if (typeof colour === 'string') return { name: colour.trim(), hex: '#D4C5B9' };
    if (!colour || typeof colour.name !== 'string' || !colour.name.trim()) throw httpError(400, 'Each colour needs a name.');
    return { name: colour.name.trim(), hex: /^#[0-9a-f]{6}$/i.test(colour.hex || '') ? colour.hex : '#D4C5B9' };
  });
};
const parseMeasurements = (value) => {
  if (value === undefined || value === null || value === '') return undefined;
  const data = typeof value === 'string' ? JSON.parse(value) : value;
  if (!data || typeof data !== 'object' || Array.isArray(data) || Object.keys(data).length > 20) throw httpError(400, 'Measurements must be a size-to-measurement object.');
  for (const [size, measurements] of Object.entries(data)) {
    if (!size.trim() || !measurements || typeof measurements !== 'object' || Array.isArray(measurements)) throw httpError(400, 'Each size must contain named measurements.');
    for (const amount of Object.values(measurements)) if (typeof amount !== 'number' || !Number.isFinite(amount) || amount < 0) throw httpError(400, 'Measurements must be non-negative numbers.');
  }
  return data;
};

export const getProducts = asyncHandler(async (req, res) => {
  const query = {};
  if (!isAdmin(req)) {
    query.active = { $ne: false };
    query.gender = { $in: ['men', 'unisex'] };
  }
  const { category, collection, gender, size, colour, minPrice, maxPrice, search, featured, newArrival, bestSeller } = req.query;
  if (category && !['all', 'All'].includes(String(category))) query.category = { $regex: `^${escapeRegex(String(category).slice(0, 100))}$`, $options: 'i' };
  if (collection) query.collectionName = String(collection).slice(0, 100);
  if (isAdmin(req) && gender && gender !== 'all') query.gender = String(gender).toLowerCase();
  if (size) query.sizes = String(size).slice(0, 20);
  if (colour) query['colours.name'] = { $regex: escapeRegex(String(colour).slice(0, 50)), $options: 'i' };
  const minPricePaise = minPrice === undefined ? undefined : parseMoneyPaise(minPrice, 'Minimum price');
  const maxPricePaise = maxPrice === undefined ? undefined : parseMoneyPaise(maxPrice, 'Maximum price');
  if (minPricePaise !== undefined && maxPricePaise !== undefined && minPricePaise > maxPricePaise) throw httpError(400, 'Price range is invalid.');
  const effectivePriceFilter = buildEffectivePriceFilter(minPricePaise, maxPricePaise);
  if (effectivePriceFilter) query.$expr = effectivePriceFilter.$expr;
  if (featured === 'true') query.featured = true;
  if (newArrival === 'true') query.newArrival = true;
  if (bestSeller === 'true') query.bestSeller = true;
  if (search) {
    const term = escapeRegex(String(search).slice(0, 100));
    query.$or = [{ name: { $regex: term, $options: 'i' } }, { description: { $regex: term, $options: 'i' } }, { category: { $regex: term, $options: 'i' } }];
  }
  const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, Number.parseInt(req.query.limit, 10) || 24));
  const sortMap = {
    'price-asc': { pricePaise: 1 }, 'Price: Low to High': { pricePaise: 1 },
    'price-desc': { pricePaise: -1 }, 'Price: High to Low': { pricePaise: -1 },
    featured: { featured: -1, createdAt: -1 }, Featured: { featured: -1, createdAt: -1 },
    popular: { bestSeller: -1, createdAt: -1 }, 'Best Sellers': { bestSeller: -1, createdAt: -1 },
    newest: { createdAt: -1 }, Newest: { createdAt: -1 }
  };
  const sort = sortMap[req.query.sort] || sortMap.newest;
  const [products, totalCount] = await Promise.all([
    Product.find(query).sort(sort).skip((page - 1) * limit).limit(limit),
    Product.countDocuments(query)
  ]);
  res.json({ success: true, count: products.length, totalCount, totalPages: Math.ceil(totalCount / limit), currentPage: page, products });
});

export const getProductById = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) throw httpError(404, 'Product not found.', 'PRODUCT_NOT_FOUND');
  const filter = { _id: req.params.id };
  if (!isAdmin(req)) Object.assign(filter, { active: { $ne: false }, gender: { $in: ['men', 'unisex'] } });
  const product = await Product.findOne(filter);
  if (!product) throw httpError(404, 'Product not found.', 'PRODUCT_NOT_FOUND');
  const relatedProducts = await Product.find({ category: product.category, active: { $ne: false }, gender: { $in: ['men', 'unisex'] }, _id: { $ne: product._id } }).sort({ createdAt: -1 }).limit(4);
  res.json({ success: true, product, relatedProducts });
});

export const createProduct = asyncHandler(async (req, res) => {
  const body = req.body || {};
  const name = String(body.name || '').trim();
  const description = String(body.description || '').trim();
  const category = String(body.category || '').trim();
  if (name.length < 2 || !description || !category) throw httpError(400, 'Name, description and category are required.');
  const pricePaise = body.pricePaise !== undefined ? Number(body.pricePaise) : parseMoneyPaise(body.price, 'Price');
  const discountPricePaise = body.discountPricePaise !== undefined ? (body.discountPricePaise == null ? null : Number(body.discountPricePaise)) : parseMoneyPaise(body.discountPrice, 'Sale price', true);
  if (!Number.isSafeInteger(pricePaise) || pricePaise < 0 || (discountPricePaise !== null && (!Number.isSafeInteger(discountPricePaise) || discountPricePaise < 0 || discountPricePaise > pricePaise))) throw httpError(400, 'Price or sale price is invalid.');
  const sizes = parseList(body.sizes, 'Sizes', 20);
  const stock = body.stock === undefined ? 0 : Number(body.stock);
  if (!Number.isSafeInteger(stock) || stock < 0) throw httpError(400, 'Stock must be a non-negative whole number.');
  const slug = slugify(body.slug || name);
  if (!slug) throw httpError(400, 'Product slug is invalid.');
  const product = await Product.create({
    name, slug, description, shortDescription: body.shortDescription || '', category,
    gender: ['men', 'women', 'unisex'].includes(body.gender) ? body.gender : 'men',
    pricePaise, discountPricePaise, sizes, colours: parseColours(body.colours), stock,
    images: parseImages(body.images), featured: body.featured === true || body.featured === 'true',
    newArrival: body.newArrival === true || body.newArrival === 'true', bestSeller: body.bestSeller === true || body.bestSeller === 'true',
    fabricDetails: body.fabricDetails || '', fitDetails: body.fitDetails || '', careInstructions: body.careInstructions || '',
    collectionName: body.collection || body.collectionName || '', measurements: parseMeasurements(body.measurements),
    shippingDetails: body.shippingDetails || '', active: body.active !== false && body.active !== 'false'
  });
  res.status(201).json({ success: true, message: 'Product created successfully.', product });
});

export const updateProduct = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) throw httpError(404, 'Product not found.');
  const product = await Product.findById(req.params.id);
  if (!product) throw httpError(404, 'Product not found.');
  const body = req.body || {};
  const allowed = ['name', 'description', 'shortDescription', 'category', 'gender', 'sizes', 'colours', 'stock', 'images', 'featured', 'newArrival', 'bestSeller', 'fabricDetails', 'fitDetails', 'careInstructions', 'collection', 'collectionName', 'measurements', 'shippingDetails', 'active'];
  for (const key of allowed) if (body[key] !== undefined) {
    const target = key === 'collection' ? 'collectionName' : key;
    product[target] = ['sizes'].includes(key) ? parseList(body[key], 'Sizes', 20)
      : key === 'colours' ? parseColours(body[key])
      : key === 'images' ? parseImages(body[key])
      : key === 'measurements' ? parseMeasurements(body[key])
      : body[key];
  }
  if (body.price !== undefined) product.pricePaise = parseMoneyPaise(body.price, 'Price');
  if (body.pricePaise !== undefined) {
    const value = Number(body.pricePaise);
    if (!Number.isSafeInteger(value) || value < 0) throw httpError(400, 'Price in paise must be a non-negative integer.');
    product.pricePaise = value;
  }
  if (body.discountPrice !== undefined) product.discountPricePaise = parseMoneyPaise(body.discountPrice, 'Sale price', true);
  if (body.discountPricePaise !== undefined) {
    const value = body.discountPricePaise == null ? null : Number(body.discountPricePaise);
    if (value !== null && (!Number.isSafeInteger(value) || value < 0)) throw httpError(400, 'Sale price in paise must be a non-negative integer.');
    product.discountPricePaise = value;
  }
  if (product.discountPricePaise != null && product.discountPricePaise > product.pricePaise) throw httpError(400, 'Sale price cannot exceed regular price.');
  if (body.stock !== undefined && (!Number.isSafeInteger(Number(body.stock)) || Number(body.stock) < 0)) throw httpError(400, 'Stock must be a non-negative whole number.');
  await product.save();
  res.json({ success: true, message: 'Product updated successfully.', product });
});

export const archiveProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, { $set: { active: false } }, { new: true });
  if (!product) throw httpError(404, 'Product not found.');
  res.json({ success: true, message: 'Product archived successfully.', product });
});

export const getCategories = asyncHandler(async (req, res) => {
  const filter = isAdmin(req) ? {} : { active: true };
  const categories = await Category.find(filter).sort({ name: 1 }).lean();
  const counts = await Product.aggregate([
    { $match: { active: { $ne: false }, gender: { $in: ['men', 'unisex'] } } },
    { $group: { _id: { $toLower: '$category' }, count: { $sum: 1 } } }
  ]);
  const countMap = new Map(counts.map((row) => [row._id, row.count]));
  res.json({ success: true, categories: categories.map((category) => ({ ...category, itemCount: countMap.get(category.name.toLowerCase()) || 0 })) });
});

export const createCategory = asyncHandler(async (req, res) => {
  const name = String(req.body?.name || '').trim();
  if (name.length < 2 || name.length > 100) throw httpError(400, 'Category name must be between 2 and 100 characters.');
  const category = await Category.create({ name, slug: slugify(name), description: req.body.description || '', image: req.body.image || '', gender: req.body.gender || 'all' });
  res.status(201).json({ success: true, message: 'Category created successfully.', category });
});

export const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) throw httpError(404, 'Category not found.');
  for (const key of ['description', 'image', 'gender']) if (req.body[key] !== undefined) category[key] = req.body[key];
  if (req.body.name && req.body.name !== category.name) {
    if (requiredCategorySlugs.has(category.slug)) throw httpError(409, 'The four storefront category names are fixed.');
    const nextName = String(req.body.name).trim();
    const nextSlug = slugify(nextName);
    await Product.updateMany({ category: category.name }, { $set: { category: nextName } });
    category.name = nextName;
    category.slug = nextSlug;
  }
  await category.save();
  res.json({ success: true, message: 'Category updated successfully.', category });
});

export const archiveCategory = asyncHandler(async (req, res) => {
  const existing = await Category.findById(req.params.id);
  if (!existing) throw httpError(404, 'Category not found.');
  if (requiredCategorySlugs.has(existing.slug)) throw httpError(409, 'The four storefront categories cannot be deleted.');
  const category = await Category.findByIdAndUpdate(req.params.id, { $set: { active: false } }, { new: true });
  if (!category) throw httpError(404, 'Category not found.');
  res.json({ success: true, message: 'Category archived successfully.', category });
});

export const getCollections = asyncHandler(async (req, res) => {
  const records = await Collection.find(isAdmin(req) ? {} : { active: true }).sort({ name: 1 }).select('name description active');
  res.json({ success: true, collections: records.map((record) => record.name), collectionRecords: records });
});

export const createCollection = asyncHandler(async (req, res) => {
  const name = String(req.body?.name || '').trim();
  const description = String(req.body?.description || '').trim();
  if (!name || name.length > 100 || description.length > 500) throw httpError(400, 'Collection name and description are invalid.');
  const collection = await Collection.create({ name, slug: slugify(name), description });
  res.status(201).json({ success: true, collection });
});

export const renameCollection = asyncHandler(async (req, res) => {
  const currentName = String(req.params.name || '').trim();
  const nextName = String(req.body?.name || '').trim();
  if (!nextName || nextName.length > 100) throw httpError(400, 'Provide a valid collection name.');
  const collection = await Collection.findOne({ name: currentName });
  if (!collection) throw httpError(404, 'Collection not found.');
  const nextSlug = slugify(nextName);
  await Product.updateMany({ collectionName: currentName }, { $set: { collectionName: nextName } });
  collection.name = nextName;
  collection.slug = nextSlug;
  if (req.body.description !== undefined) collection.description = String(req.body.description).slice(0, 500);
  await collection.save();
  res.json({ success: true, collection });
});

export const removeCollection = asyncHandler(async (req, res) => {
  const name = String(req.params.name || '').trim();
  const result = await Product.updateMany({ collectionName: name }, { $set: { collectionName: '' } });
  const deleted = await Collection.deleteOne({ name });
  if (!deleted.deletedCount) throw httpError(404, 'Collection not found.');
  res.json({ success: true, updatedCount: result.modifiedCount });
});
