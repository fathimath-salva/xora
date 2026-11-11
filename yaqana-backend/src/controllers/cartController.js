import mongoose from 'mongoose';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import { asyncHandler, httpError } from '../utils/http.js';

async function populatedCart(userId) {
  let cart = await Cart.findOne({ user: userId });
  if (!cart) cart = await Cart.create({ user: userId, items: [] });
  return Cart.findById(cart._id).populate('items.product');
}
function cartResponse(cart) { return { success: true, cart: { _id: cart._id, items: cart.items.filter((item) => item.product).map((item) => ({ _id: item._id, product: item.product, size: item.size, colour: item.colour, quantity: item.quantity })) } }; }
async function validateItem(productId, size, colour, quantity) {
  if (!mongoose.isValidObjectId(productId)) throw httpError(400, 'Product selection is invalid.');
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 20) throw httpError(400, 'Quantity must be between 1 and 20.');
  const product = await Product.findOne({ _id: productId, active: { $ne: false }, gender: { $in: ['men', 'unisex'] } });
  if (!product) throw httpError(404, 'This product is no longer available.');
  if (product.sizes.length && !product.sizes.includes(size)) throw httpError(400, 'Please select a valid size.');
  if (product.colours.length && !product.colours.some((c) => c.name.toLowerCase() === String(colour).toLowerCase())) throw httpError(400, 'Please select a valid colour.');
  if (product.stock < quantity) throw httpError(409, 'The selected quantity is not currently available.');
  return product;
}
export const getCart = asyncHandler(async (req, res) => res.json(cartResponse(await populatedCart(req.user._id))));
export const addToCart = asyncHandler(async (req, res) => {
  const { productId, size = 'N/A', colour = 'Default', quantity = 1 } = req.body || {};
  await validateItem(productId, size, colour, quantity);
  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) cart = new Cart({ user: req.user._id, items: [] });
  const existing = cart.items.find((item) => String(item.product) === String(productId) && item.size === size && item.colour === colour);
  if (existing) {
    const nextQuantity = existing.quantity + quantity;
    await validateItem(productId, size, colour, nextQuantity);
    existing.quantity = nextQuantity;
  } else cart.items.push({ product: productId, size, colour, quantity });
  await cart.save();
  res.json(cartResponse(await Cart.findById(cart._id).populate('items.product')));
});
export const updateQuantity = asyncHandler(async (req, res) => {
  const { itemId, quantity } = req.body || {};
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 20) throw httpError(400, 'Quantity must be between 1 and 20.');
  const cart = await Cart.findOne({ user: req.user._id });
  const item = cart?.items.id(itemId);
  if (!item) throw httpError(404, 'Cart item not found.');
  await validateItem(item.product, item.size, item.colour, quantity);
  item.quantity = quantity;
  await cart.save();
  res.json(cartResponse(await Cart.findById(cart._id).populate('items.product')));
});
export const removeFromCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) throw httpError(404, 'Cart not found.');
  const item = cart.items.id(req.params.itemId);
  if (!item) throw httpError(404, 'Cart item not found.');
  item.deleteOne();
  await cart.save();
  res.json(cartResponse(await Cart.findById(cart._id).populate('items.product')));
});
export const syncCart = asyncHandler(async (req, res) => {
  const items = req.body?.items;
  if (!Array.isArray(items) || items.length > 50) throw httpError(400, 'Cart items are invalid.');
  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) cart = new Cart({ user: req.user._id, items: [] });
  for (const entry of items) {
    const { productId, size = 'N/A', colour = 'Default', quantity = 1 } = entry || {};
    await validateItem(productId, size, colour, quantity);
    const existing = cart.items.find((item) => String(item.product) === String(productId) && item.size === size && item.colour === colour);
    if (existing) {
      const mergedQuantity = Math.min(20, Math.max(existing.quantity, quantity));
      await validateItem(productId, size, colour, mergedQuantity);
      existing.quantity = mergedQuantity;
    }
    else cart.items.push({ product: productId, size, colour, quantity });
  }
  await cart.save();
  res.json(cartResponse(await Cart.findById(cart._id).populate('items.product')));
});
