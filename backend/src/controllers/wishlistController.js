import Wishlist from '../models/Wishlist.js';
import Product from '../models/Product.js';

export const getWishlist = async (req, res, next) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user._id }).populate({
      path: 'products',
      select: 'name price discountPrice images category stock sizes colours'
    });

    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user._id, products: [] });
    }

    res.status(200).json({
      success: true,
      wishlist: wishlist.products
    });
  } catch (error) {
    next(error);
  }
};

export const toggleWishlist = async (req, res, next) => {
  try {
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required.'
      });
    }

    let wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) {
      wishlist = new Wishlist({ user: req.user._id, products: [] });
    }

    const index = wishlist.products.findIndex((p) => p.toString() === productId);
    let added = false;

    if (index > -1) {
      wishlist.products.splice(index, 1);
      added = false;
    } else {
      wishlist.products.push(productId);
      added = true;
    }

    await wishlist.save();
    await wishlist.populate({
      path: 'products',
      select: 'name price discountPrice images category stock sizes colours'
    });

    res.status(200).json({
      success: true,
      added,
      message: added ? 'Added to your wishlist.' : 'Removed from your wishlist.',
      wishlist: wishlist.products
    });
  } catch (error) {
    next(error);
  }
};
