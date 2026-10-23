import Product from '../models/Product.js';
import Collection from '../models/Collection.js';

const parseMeasurements = (value) => {
  if (value === undefined || value === null || value === '') return undefined;
  let data = value;
  if (typeof data === 'string') {
    try { data = JSON.parse(data); } catch { throw Object.assign(new Error('Measurements must be valid JSON.'), { statusCode: 400 }); }
  }
  if (!data || typeof data !== 'object' || Array.isArray(data) || Object.keys(data).length > 15) {
    throw Object.assign(new Error('Measurements must be a size-to-measurement object.'), { statusCode: 400 });
  }
  for (const [size, values] of Object.entries(data)) {
    if (!size.trim() || !values || typeof values !== 'object' || Array.isArray(values) || Object.keys(values).length > 12) {
      throw Object.assign(new Error('Each size must contain named garment measurements.'), { statusCode: 400 });
    }
    for (const [label, amount] of Object.entries(values)) {
      if (!label.trim() || typeof amount !== 'number' || !Number.isFinite(amount) || amount < 0) {
        throw Object.assign(new Error('Garment measurements must be non-negative numbers.'), { statusCode: 400 });
      }
      values[label] = Number(amount);
    }
  }
  return data;
};

const parseSizes = (value) => {
  const sizes = typeof value === 'string' ? value.split(',') : value;
  if (sizes === undefined || sizes === null) return [];
  if (!Array.isArray(sizes) || sizes.length > 20 || sizes.some((size) => typeof size !== 'string' || !size.trim() || size.length > 12)) {
    throw Object.assign(new Error('Sizes must be a list of valid size labels.'), { statusCode: 400 });
  }
  const normalized = sizes.map((size) => size.trim());
  if (new Set(normalized).size !== normalized.length) throw Object.assign(new Error('Duplicate sizes are not allowed.'), { statusCode: 400 });
  return normalized;
};

export const getProducts = async (req, res, next) => {
  try {
    const {
      category,
      collection,
      gender,
      size,
      colour,
      minPrice,
      maxPrice,
      search,
      featured,
      newArrival,
      bestSeller,
      sort = 'newest',
      page = 1,
      limit = 24
    } = req.query;

    const query = {};
    const isAdmin = req.user?.role === 'admin';

    if (!isAdmin) {
      query.gender = { $in: ['men', 'unisex'] };
      // Include legacy records where active was never set. Explicitly archived
      // records (active: false) remain excluded.
      query.active = { $ne: false };
    }

    if (category && category !== 'All' && category !== 'all') {
      if (String(category).length > 100) return res.status(400).json({ success: false, message: 'Category filter is too long.' });
      const escapedCategory = String(category).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.category = { $regex: new RegExp(`^${escapedCategory}$`, 'i') };
    }
    if (collection) {
      if (String(collection).length > 100) return res.status(400).json({ success: false, message: 'Collection filter is too long.' });
      query.collectionName = collection;
    }

    if (isAdmin && gender && gender !== 'all') {
      query.gender = { $in: [gender.toLowerCase(), 'unisex'] };
    }

    if (size) {
      if (String(size).length > 20) return res.status(400).json({ success: false, message: 'Size filter is invalid.' });
      query.sizes = size;
    }

    if (colour) {
      if (String(colour).length > 100) return res.status(400).json({ success: false, message: 'Colour filter is too long.' });
      const escapedColour = String(colour).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query['colours.name'] = { $regex: new RegExp(escapedColour, 'i') };
    }

    if (minPrice || maxPrice) {
      const min = minPrice === undefined ? undefined : Number(minPrice);
      const max = maxPrice === undefined ? undefined : Number(maxPrice);
      if ((min !== undefined && (!Number.isFinite(min) || min < 0)) || (max !== undefined && (!Number.isFinite(max) || max < 0)) || (min !== undefined && max !== undefined && min > max)) {
        return res.status(400).json({ success: false, message: 'Price range is invalid.' });
      }
      query.price = {};
      if (min !== undefined) query.price.$gte = min;
      if (max !== undefined) query.price.$lte = max;
    }

    if (featured === 'true' || featured === true) {
      query.featured = true;
    }

    if (newArrival === 'true' || newArrival === true) {
      query.newArrival = true;
    }

    if (bestSeller === 'true' || bestSeller === true) {
      query.bestSeller = true;
    }

    if (search) {
      const escapedSearch = String(search).slice(0, 100).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.$or = [
        { name: { $regex: escapedSearch, $options: 'i' } },
        { description: { $regex: escapedSearch, $options: 'i' } },
        { category: { $regex: escapedSearch, $options: 'i' } }
      ];
    }

    let sortOptions = {};
    switch (sort) {
      case 'price-asc':
      case 'Price: Low to High':
        sortOptions = { price: 1 };
        break;
      case 'price-desc':
      case 'Price: High to Low':
        sortOptions = { price: -1 };
        break;
      case 'newest':
      case 'Newest':
        sortOptions = { createdAt: -1 };
        break;
      case 'featured':
      case 'Featured':
        sortOptions = { featured: -1, createdAt: -1 };
        break;
      case 'popular':
      case 'Best Sellers':
        sortOptions = { bestSeller: -1, createdAt: -1 };
        break;
      default:
        sortOptions = { createdAt: -1 };
    }

    const pageNum = Math.max(1, Number.parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, Number.parseInt(limit, 10) || 24));
    const skip = (pageNum - 1) * limitNum;

    const [products, totalCount] = await Promise.all([
      Product.find(query).sort(sortOptions).skip(skip).limit(limitNum),
      Product.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      count: products.length,
      totalCount,
      totalPages: Math.ceil(totalCount / limitNum),
      currentPage: pageNum,
      products
    });
  } catch (error) {
    next(error);
  }
};

export const getProductById = async (req, res, next) => {
  try {
    const isAdmin = req.user?.role === 'admin';
    const product = await Product.findOne({
      _id: req.params.id,
      ...(isAdmin ? {} : {
        gender: { $in: ['men', 'unisex'] },
        active: { $ne: false }
      })
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.'
      });
    }

    // Also fetch related products in same category
    const relatedProducts = await Product.find({
      category: product.category,
      ...(isAdmin ? {} : { gender: { $in: ['men', 'unisex'] }, active: { $ne: false } }),
      _id: { $ne: product._id }
    }).limit(4);

    res.status(200).json({
      success: true,
      product,
      relatedProducts
    });
  } catch (error) {
    next(error);
  }
};

export const createProduct = async (req, res, next) => {
  try {
    const {
      name,
      description,
      category,
      gender,
      price,
      discountPrice,
      sizes,
      colours,
      stock,
      images,
      featured,
      newArrival,
      bestSeller,
      fabricDetails,
      fitDetails,
      shippingDetails,
      shortDescription,
      careInstructions,
      collection,
      measurements,
      active
    } = req.body;

    if (!name || !description || price === undefined || !Number.isFinite(Number(price)) || Number(price) < 0 || !category || !gender) {
      return res.status(400).json({
        success: false,
        message: 'Name, price, category, and gender are required.'
      });
    }

    const parsedSizes = parseSizes(sizes);

    let parsedColours = colours;
    if (typeof colours === 'string') {
      parsedColours = colours.split(',').map((c) => ({ name: c.trim(), hex: '#D4C5B9' }));
    }

    const parsedImages = typeof images === 'string' ? images.split(',').map((image) => image.trim()).filter(Boolean) : images;
    if (!Array.isArray(parsedImages) || parsedImages.length === 0 || parsedImages.some((image) => typeof image !== 'string' || image.length > 2048)) {
      return res.status(400).json({ success: false, message: 'Provide at least one valid product image.' });
    }
    const priceValue = Number(price);
    const discountValue = discountPrice === '' || discountPrice === null || discountPrice === undefined ? null : Number(discountPrice);
    if (discountValue !== null && (!Number.isFinite(discountValue) || discountValue < 0 || discountValue > priceValue)) {
      return res.status(400).json({ success: false, message: 'Sale price must be a valid amount no greater than the regular price.' });
    }
    const stockValue = stock === undefined ? 0 : Number(stock);
    if (!Number.isInteger(stockValue) || stockValue < 0) return res.status(400).json({ success: false, message: 'Stock must be a non-negative whole number.' });
    const parsedMeasurements = parseMeasurements(measurements);

    const product = await Product.create({
      name,
      slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      description,
      category,
      gender,
      price: Number(price),
      discountPrice: discountValue,
      sizes: parsedSizes,
      colours: parsedColours || [],
      stock: stockValue,
      images: parsedImages,
      featured: Boolean(featured),
      newArrival: Boolean(newArrival),
      bestSeller: Boolean(bestSeller),
      fabricDetails,
      fitDetails,
      shippingDetails,
      shortDescription,
      careInstructions,
      collectionName: collection,
      measurements: parsedMeasurements,
      active: active !== undefined ? Boolean(active) : true
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully.',
      product
    });
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.'
      });
    }

    const updates = { ...req.body };
    const allowedFields = new Set(['name', 'description', 'shortDescription', 'category', 'gender', 'price', 'discountPrice', 'sizes', 'colours', 'stock', 'images', 'featured', 'newArrival', 'bestSeller', 'fabricDetails', 'fitDetails', 'careInstructions', 'collection', 'measurements', 'shippingDetails', 'active']);
    for (const key of Object.keys(updates)) if (!allowedFields.has(key)) delete updates[key];
    if (Object.hasOwn(updates, 'collection')) {
      updates.collectionName = updates.collection;
      delete updates.collection;
    }
    if (Object.hasOwn(updates, 'sizes')) updates.sizes = parseSizes(updates.sizes);
    if (updates.colours && typeof updates.colours === 'string') {
      updates.colours = updates.colours.split(',').map((c) => ({ name: c.trim(), hex: '#D4C5B9' }));
    }
    if (Object.hasOwn(updates, 'images')) {
      updates.images = typeof updates.images === 'string' ? updates.images.split(',').map((image) => image.trim()).filter(Boolean) : updates.images;
      if (!Array.isArray(updates.images) || updates.images.length === 0 || updates.images.some((image) => typeof image !== 'string' || image.length > 2048)) {
        return res.status(400).json({ success: false, message: 'Provide at least one valid product image.' });
      }
    }
    if (Object.hasOwn(updates, 'measurements')) updates.measurements = parseMeasurements(updates.measurements);
    if (updates.price !== undefined) {
      updates.price = Number(updates.price);
      if (!Number.isFinite(updates.price) || updates.price < 0) return res.status(400).json({ success: false, message: 'Price must be a non-negative amount.' });
    }
    if (updates.price !== undefined && updates.discountPrice === undefined && product.discountPrice != null && product.discountPrice > updates.price) {
      return res.status(400).json({ success: false, message: 'Update the sale price before lowering the regular price.' });
    }
    if (updates.discountPrice !== undefined) {
      updates.discountPrice = updates.discountPrice === '' || updates.discountPrice === null ? null : Number(updates.discountPrice);
      if (updates.discountPrice !== null && (!Number.isFinite(updates.discountPrice) || updates.discountPrice < 0 || updates.discountPrice > (updates.price ?? product.price))) {
        return res.status(400).json({ success: false, message: 'Sale price must be a valid amount no greater than the regular price.' });
      }
    }
    if (updates.stock !== undefined) {
      updates.stock = Number(updates.stock);
      if (!Number.isInteger(updates.stock) || updates.stock < 0) return res.status(400).json({ success: false, message: 'Stock must be a non-negative whole number.' });
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Product updated successfully.',
      product: updatedProduct
    });
  } catch (error) {
    next(error);
  }
};

export const getCollections = async (req, res, next) => {
  try {
    const isAdmin = req.user?.role === 'admin';
    const records = await Collection.find(isAdmin ? {} : { active: { $ne: false } }).sort({ name: 1 }).select('name description active');
    res.status(200).json({ success: true, collections: records.map((collection) => collection.name), collectionRecords: records });
  } catch (error) { next(error); }
};

export const createCollection = async (req, res, next) => {
  try {
    const name = String(req.body?.name || '').trim();
    const description = String(req.body?.description || '').trim();
    if (!name || name.length > 100 || description.length > 500) return res.status(400).json({ success: false, message: 'Collection name is required and must be under 100 characters.' });
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const collection = await Collection.create({ name, slug, description });
    res.status(201).json({ success: true, collection });
  } catch (error) { next(error); }
};

export const renameCollection = async (req, res, next) => {
  try {
    const currentName = String(req.params.name || '').trim();
    const nextName = String(req.body?.name || '').trim();
    if (!currentName || !nextName || currentName.length > 100 || nextName.length > 100) {
      return res.status(400).json({ success: false, message: 'Provide a collection name up to 100 characters.' });
    }
    const collection = await Collection.findOne({ name: currentName });
    if (!collection) return res.status(404).json({ success: false, message: 'Collection not found.' });
    const slug = nextName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const description = req.body?.description === undefined ? collection.description : String(req.body.description).trim();
    if (description.length > 500) return res.status(400).json({ success: false, message: 'Collection description cannot exceed 500 characters.' });
    if (await Collection.exists({ _id: { $ne: collection._id }, $or: [{ name: nextName }, { slug }] })) {
      return res.status(409).json({ success: false, message: 'A collection with that name already exists.' });
    }
    const result = await Product.updateMany({ collectionName: currentName }, { $set: { collectionName: nextName } });
    collection.name = nextName;
    collection.slug = slug;
    collection.description = description;
    await collection.save();
    res.status(200).json({ success: true, updatedCount: result.modifiedCount });
  } catch (error) { next(error); }
};

export const removeCollection = async (req, res, next) => {
  try {
    const name = String(req.params.name || '').trim();
    if (!name || name.length > 100) return res.status(400).json({ success: false, message: 'Collection name is invalid.' });
    const result = await Product.updateMany({ collectionName: name }, { $set: { collectionName: '' } });
    await Collection.deleteOne({ name });
    res.status(200).json({ success: true, updatedCount: result.modifiedCount });
  } catch (error) { next(error); }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.'
      });
    }

    // Product IDs can be referenced by historical order items. Archive instead
    // of physically deleting the record.
    product.active = false;
    await product.save();

    res.status(200).json({
      success: true,
      message: 'Product archived successfully.',
      product
    });
  } catch (error) {
    next(error);
  }
};
