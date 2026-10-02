import Product from '../models/Product.js';

export const getProducts = async (req, res, next) => {
  try {
    const {
      category,
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

    if (category && category !== 'All' && category !== 'all') {
      query.category = { $regex: new RegExp(`^${category}$`, 'i') };
    }

    if (gender && gender !== 'all') {
      query.gender = { $in: [gender.toLowerCase(), 'unisex'] };
    }

    if (size) {
      query.sizes = size;
    }

    if (colour) {
      query['colours.name'] = { $regex: new RegExp(colour, 'i') };
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
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
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } }
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

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
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
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.'
      });
    }

    // Also fetch related products in same category
    const relatedProducts = await Product.find({
      category: product.category,
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
      shippingDetails
    } = req.body;

    if (!name || !price || !category || !gender) {
      return res.status(400).json({
        success: false,
        message: 'Name, price, category, and gender are required.'
      });
    }

    let parsedSizes = sizes;
    if (typeof sizes === 'string') {
      parsedSizes = sizes.split(',').map((s) => s.trim()).filter(Boolean);
    }

    let parsedColours = colours;
    if (typeof colours === 'string') {
      parsedColours = colours.split(',').map((c) => ({ name: c.trim(), hex: '#D4C5B9' }));
    }

    let parsedImages = images;
    if (typeof images === 'string') {
      parsedImages = [images];
    } else if (!images || images.length === 0) {
      parsedImages = [
        'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1000&q=85'
      ];
    }

    const product = await Product.create({
      name,
      slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      description: description || 'Designed with premium fabric, exceptional cut, and elevated minimalism.',
      category,
      gender,
      price: Number(price),
      discountPrice: discountPrice ? Number(discountPrice) : null,
      sizes: parsedSizes && parsedSizes.length > 0 ? parsedSizes : ['S', 'M', 'L', 'XL'],
      colours: parsedColours && parsedColours.length > 0 ? parsedColours : [{ name: 'Neutral', hex: '#D4C5B9' }],
      stock: stock !== undefined ? Number(stock) : 25,
      images: parsedImages,
      featured: Boolean(featured),
      newArrival: Boolean(newArrival),
      bestSeller: Boolean(bestSeller),
      fabricDetails,
      fitDetails,
      shippingDetails
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
    if (updates.sizes && typeof updates.sizes === 'string') {
      updates.sizes = updates.sizes.split(',').map((s) => s.trim()).filter(Boolean);
    }
    if (updates.colours && typeof updates.colours === 'string') {
      updates.colours = updates.colours.split(',').map((c) => ({ name: c.trim(), hex: '#D4C5B9' }));
    }
    if (updates.images && typeof updates.images === 'string') {
      updates.images = [updates.images];
    }
    if (updates.price) updates.price = Number(updates.price);
    if (updates.discountPrice !== undefined) updates.discountPrice = updates.discountPrice ? Number(updates.discountPrice) : null;
    if (updates.stock !== undefined) updates.stock = Number(updates.stock);

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

export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.'
      });
    }

    await Product.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};
