import mongoose from 'mongoose';
import Wishlist from '../models/Wishlist.js';
import Product from '../models/Product.js';
import { asyncHandler, httpError } from '../utils/http.js';
export const getWishlist = asyncHandler(async (req, res) => {
  let wishlist = await Wishlist.findOne({ user: req.user._id });
  if (!wishlist) wishlist = await Wishlist.create({ user: req.user._id, products: [] });
  const populated = await Wishlist.findById(wishlist._id).populate({ path: 'products', match: { active: { $ne: false } } });
  res.json({ success: true, wishlist: populated.products.filter(Boolean) });
});
export const toggleWishlist = asyncHandler(async (req, res) => {
  const productId = req.body?.productId;
  if (!mongoose.isValidObjectId(productId)) throw httpError(400, 'Product selection is invalid.');
  const product = await Product.findOne({ _id: productId, active: { $ne: false }, gender: { $in: ['men', 'unisex'] } });
  if (!product) throw httpError(404, 'Product not found.');
  let wishlist = await Wishlist.findOne({ user: req.user._id });
  if (!wishlist) wishlist = new Wishlist({ user: req.user._id, products: [] });
  const exists = wishlist.products.some((id) => String(id) === String(productId));
  if (exists) wishlist.products = wishlist.products.filter((id) => String(id) !== String(productId));
  else wishlist.products.push(productId);
  await wishlist.save();
  const populated = await Wishlist.findById(wishlist._id).populate('products');
  res.json({ success: true, added: !exists, wishlist: populated.products });
});
