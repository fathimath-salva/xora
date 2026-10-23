import Cart from '../models/Cart.js';
import Product from '../models/Product.js';

export const getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate({
      path: 'items.product',
      select: 'name price discountPrice images stock category'
    });

    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    res.status(200).json({
      success: true,
      cart
    });
  } catch (error) {
    next(error);
  }
};

export const addToCart = async (req, res, next) => {
  try {
    const { productId, size, colour, quantity = 1 } = req.body;

    if (!Number.isInteger(Number(quantity)) || Number(quantity) < 1 || Number(quantity) > 20) {
      return res.status(400).json({ success: false, message: 'Quantity must be a whole number between 1 and 20.' });
    }
    const product = await Product.findById(productId);
    if (!product || product.active !== true || !['men', 'unisex'].includes(product.gender)) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.'
      });
    }

    if (product.sizes?.length && !product.sizes.includes(size)) {
      return res.status(400).json({ success: false, message: 'Please select a valid available size.' });
    }
    if (!product.sizes?.length && size && size !== 'N/A') {
      return res.status(400).json({ success: false, message: 'This product does not have selectable sizes.' });
    }
    const selectedSize = product.sizes?.length ? size : 'N/A';

    if (product.stock < Number(quantity)) {
      return res.status(400).json({
        success: false,
        message: 'Requested quantity exceeds available stock.'
      });
    }

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }

    // Check if same product with same size and colour is already in cart
    const existingIndex = cart.items.findIndex(
      (item) =>
        item.product.toString() === productId &&
        item.size === selectedSize &&
        item.colour === colour
    );

    if (existingIndex > -1) {
      cart.items[existingIndex].quantity += Number(quantity);
      if (cart.items[existingIndex].quantity > product.stock) {
        return res.status(400).json({ success: false, message: 'Requested quantity exceeds available stock.' });
      }
    } else {
      cart.items.push({
        product: productId,
        size: selectedSize || product.sizes?.[0] || 'N/A',
        colour: colour || (product.colours && product.colours[0]?.name) || 'Default',
        quantity: Number(quantity)
      });
    }

    await cart.save();
    await cart.populate({
      path: 'items.product',
      select: 'name price discountPrice images stock category'
    });

    res.status(200).json({
      success: true,
      message: 'Item added to shopping bag.',
      cart
    });
  } catch (error) {
    next(error);
  }
};

export const updateQuantity = async (req, res, next) => {
  try {
    const { itemId, quantity } = req.body;

    if (!itemId || quantity === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Item ID and quantity are required.'
      });
    }

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found.'
      });
    }

    const item = cart.items.id(itemId);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in bag.'
      });
    }

    if (quantity <= 0) {
      cart.items.pull(itemId);
    } else {
      if (!Number.isInteger(Number(quantity)) || Number(quantity) > 20) {
        return res.status(400).json({ success: false, message: 'Quantity must be a whole number between 1 and 20.' });
      }
      const product = await Product.findById(item.product);
      if (!product || product.active !== true || !['men', 'unisex'].includes(product.gender) || Number(quantity) > product.stock || (product.sizes?.length && !product.sizes.includes(item.size))) {
        return res.status(400).json({ success: false, message: 'Requested size or quantity is unavailable.' });
      }
      item.quantity = Number(quantity);
    }

    await cart.save();
    await cart.populate({
      path: 'items.product',
      select: 'name price discountPrice images stock category'
    });

    res.status(200).json({
      success: true,
      cart
    });
  } catch (error) {
    next(error);
  }
};

export const removeFromCart = async (req, res, next) => {
  try {
    const { itemId } = req.params;

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found.'
      });
    }

    cart.items.pull(itemId);
    await cart.save();
    await cart.populate({
      path: 'items.product',
      select: 'name price discountPrice images stock category'
    });

    res.status(200).json({
      success: true,
      message: 'Item removed from shopping bag.',
      cart
    });
  } catch (error) {
    next(error);
  }
};

export const syncCart = async (req, res, next) => {
  try {
    const { items = [] } = req.body;
    if (!Array.isArray(items) || items.length > 50) {
      return res.status(400).json({ success: false, message: 'Cart must contain no more than 50 items.' });
    }
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }

    for (const item of items) {
      const quantity = Number(item?.quantity ?? 1);
      if (!Number.isInteger(quantity) || quantity < 1 || quantity > 20) {
        return res.status(400).json({ success: false, message: 'Cart quantities must be whole numbers between 1 and 20.' });
      }
      const product = await Product.findById(item.productId);
      if (!product || product.active !== true || !['men', 'unisex'].includes(product.gender) || product.stock < quantity) {
        return res.status(400).json({ success: false, message: 'A cart item is unavailable or exceeds stock.' });
      }
      if (product.sizes?.length && !product.sizes.includes(item.size)) {
        return res.status(400).json({ success: false, message: `Select a valid size for ${product.name}.` });
      }
      const normalizedSize = product.sizes?.length ? item.size : 'N/A';
      const existing = cart.items.find(
        (i) =>
          i.product.toString() === item.productId &&
          i.size === normalizedSize &&
          i.colour === item.colour
      );
      if (existing) {
        existing.quantity = Math.max(existing.quantity, quantity);
        if (existing.quantity > product.stock) return res.status(400).json({ success: false, message: 'Cart quantity exceeds available stock.' });
      } else {
        cart.items.push({
          product: item.productId,
          size: normalizedSize,
          colour: item.colour || 'Default',
          quantity
        });
      }
    }

    await cart.save();
    await cart.populate({
      path: 'items.product',
      select: 'name price discountPrice images stock category'
    });

    res.status(200).json({
      success: true,
      cart
    });
  } catch (error) {
    next(error);
  }
};
