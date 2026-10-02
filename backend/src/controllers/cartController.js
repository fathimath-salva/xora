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

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.'
      });
    }

    if (product.stock < quantity) {
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
        item.size === size &&
        item.colour === colour
    );

    if (existingIndex > -1) {
      cart.items[existingIndex].quantity += Number(quantity);
    } else {
      cart.items.push({
        product: productId,
        size: size || (product.sizes && product.sizes[0]) || 'M',
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
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }

    for (const item of items) {
      const existing = cart.items.find(
        (i) =>
          i.product.toString() === item.productId &&
          i.size === item.size &&
          i.colour === item.colour
      );
      if (existing) {
        existing.quantity = Math.max(existing.quantity, item.quantity);
      } else if (item.productId) {
        cart.items.push({
          product: item.productId,
          size: item.size || 'M',
          colour: item.colour || 'Default',
          quantity: item.quantity || 1
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
