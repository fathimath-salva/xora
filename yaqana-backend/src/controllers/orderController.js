import { createHash } from 'node:crypto';
import mongoose from 'mongoose';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Cart from '../models/Cart.js';
import { asyncHandler, httpError } from '../utils/http.js';
import { env } from '../config/env.js';
import { PAISE_PER_CATALOG_UNIT, paiseToCatalogUnits } from '../utils/money.js';
import {
  canTransitionOrderStatus,
  getAllowedOrderTransitions,
  isKnownOrderStatus
} from '../utils/orderStatus.js';

const allowedPaymentMethods = new Set(['Cash on Delivery', 'Google Pay (UPI)', 'PhonePe (UPI)', 'Paytm (UPI)', 'UPI']);
const requestFingerprint = (body) => createHash('sha256').update(JSON.stringify({
  items: (body.items || []).map((item) => ({ product: String(item.product || item.productId), quantity: item.quantity, size: item.size || 'N/A', colour: item.colour || 'Default' })).sort((a, b) => a.product.localeCompare(b.product) || a.size.localeCompare(b.size) || a.colour.localeCompare(b.colour)),
  shippingAddress: body.shippingAddress, paymentMethod: body.paymentMethod, notes: body.notes || ''
})).digest('hex');

function validateAddress(address) {
  if (!address || !address.fullName || !address.addressLine1 || !address.city || !address.state) throw httpError(400, 'Please provide full shipping details.');
  if (!/^\d{6}$/.test(String(address.postalCode || ''))) throw httpError(400, 'Enter a valid 6-digit PIN code.');
  if (!/^\d{10}$/.test(String(address.phone || '').replace(/\D/g, ''))) throw httpError(400, 'Enter a valid 10-digit phone number.');
}

export const createOrder = asyncHandler(async (req, res) => {
  const { items, shippingAddress, paymentMethod = 'Google Pay (UPI)', notes = '' } = req.body || {};
  const idempotencyKey = req.get('Idempotency-Key');
  if (!idempotencyKey || !/^[A-Za-z0-9_-]{16,100}$/.test(idempotencyKey)) throw httpError(400, 'A valid checkout request key is required. Please retry checkout.');
  if (!Array.isArray(items) || items.length === 0 || items.length > 50) throw httpError(400, 'Your bag is empty or contains too many items.');
  if (!allowedPaymentMethods.has(paymentMethod)) throw httpError(400, 'Please select a supported payment method.');
  validateAddress(shippingAddress);
  const requestHash = requestFingerprint(req.body);
  const existing = await Order.findOne({ customer: req.user._id, idempotencyKey }).select('+requestHash');
  if (existing) {
    if (existing.requestHash !== requestHash) throw httpError(409, 'This checkout key was already used for a different order. Please refresh checkout.', 'IDEMPOTENCY_KEY_REUSED');
    return res.json({ success: true, message: 'This checkout was already completed.', order: existing });
  }

  const session = await mongoose.startSession();
  let order;
  try {
    await session.withTransaction(async () => {
      const orderItems = [];
      let subtotalPaise = 0;
      for (const item of items) {
        const productId = item?.product || item?.productId;
        const quantity = Number(item?.quantity);
        if (!mongoose.isValidObjectId(productId) || !Number.isInteger(quantity) || quantity < 1 || quantity > 20) throw httpError(400, 'One of the selected products or quantities is invalid.');
        const product = await Product.findOne({ _id: productId, active: { $ne: false }, gender: { $in: ['men', 'unisex'] } }).session(session);
        if (!product) throw httpError(404, 'One of the selected products is no longer available.');
        const size = String(item.size || 'N/A');
        const colour = String(item.colour || 'Default');
        if (product.sizes.length && !product.sizes.includes(size)) throw httpError(400, `Please select a valid size for ${product.name}.`);
        if (product.colours.length && !product.colours.some((entry) => entry.name.toLowerCase() === colour.toLowerCase())) throw httpError(400, `Please select a valid colour for ${product.name}.`);
        const updated = await Product.findOneAndUpdate({ _id: product._id, stock: { $gte: quantity }, active: { $ne: false } }, { $inc: { stock: -quantity } }, { new: true, session });
        if (!updated) throw httpError(409, `Insufficient stock for ${product.name}.`);
        const pricePaise = product.discountPricePaise ?? product.pricePaise;
        subtotalPaise += pricePaise * quantity;
        orderItems.push({ product: product._id, name: product.name, image: product.images[0] || '', category: product.category, pricePaise, quantity, size, colour });
      }
      // Compatibility pricing mirrors the currently deployed storefront until its pricing UI is updated.
      // These are legacy provisional settings, not approved final YAQANA shipping/tax policy.
      const thresholdPaise = env.LEGACY_SHIPPING_THRESHOLD * PAISE_PER_CATALOG_UNIT;
      const shippingFeePaise = subtotalPaise >= thresholdPaise ? 0 : Math.round(env.LEGACY_SHIPPING_FEE * PAISE_PER_CATALOG_UNIT);
      const taxCatalogCents = Math.round((subtotalPaise / PAISE_PER_CATALOG_UNIT) * env.LEGACY_TAX_RATE * 100);
      const taxPaise = taxCatalogCents * (PAISE_PER_CATALOG_UNIT / 100);
      const totalPaise = subtotalPaise + shippingFeePaise + taxPaise;
      [order] = await Order.create([{
        customer: req.user._id, idempotencyKey, requestHash, items: orderItems, shippingAddress,
        paymentMethod, paymentStatus: 'Pending', orderStatus: 'Confirmed',
        subtotalPaise, shippingFeePaise, taxPaise, totalPaise, notes: String(notes).slice(0, 1000),
        statusHistory: [{ status: 'Confirmed', changedBy: req.user._id, reason: 'Order placed through storefront' }]
      }], { session });
      await Cart.findOneAndUpdate({ user: req.user._id }, { $set: { items: [] } }, { session });
    });
  } catch (error) {
    if (error.code === 11000) {
      const prior = await Order.findOne({ customer: req.user._id, idempotencyKey }).select('+requestHash');
      if (prior && prior.requestHash === requestHash) return res.json({ success: true, message: 'This checkout was already completed.', order: prior });
      if (prior) throw httpError(409, 'This checkout key was already used for a different order.', 'IDEMPOTENCY_KEY_REUSED');
    }
    throw error;
  } finally {
    await session.endSession();
  }
  res.status(201).json({ success: true, message: 'Order placed successfully. Payment has not been processed in this test checkout.', order });
});

export const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ customer: req.user._id }).sort({ createdAt: -1 });
  res.json({ success: true, orders });
});

export const getOrderById = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) throw httpError(404, 'Order not found.');
  const order = await Order.findById(req.params.id).populate('customer', 'name email phone');
  if (!order) throw httpError(404, 'Order not found.');
  const ownerId = order.customer?._id || order.customer;
  if (String(ownerId) !== String(req.user._id) && req.user.role !== 'admin') throw httpError(403, 'You are not allowed to view this order.');
  res.json({ success: true, order });
});

export const getAllOrders = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, Number.parseInt(req.query.limit, 10) || 50));
  const query = {};
  if (req.query.status && req.query.status !== 'all') query.orderStatus = req.query.status;
  if (req.query.search) {
    const term = String(req.query.search).slice(0, 100).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const customers = await (await import('../models/User.js')).default.find({ $or: [{ name: { $regex: term, $options: 'i' } }, { email: { $regex: term, $options: 'i' } }] }).select('_id');
    query.$or = [{ _id: mongoose.isValidObjectId(req.query.search) ? req.query.search : null }, { customer: { $in: customers.map((user) => user._id) } }];
  }
  const [orders, totalOrders] = await Promise.all([
    Order.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).populate('customer', 'name email phone'),
    Order.countDocuments(query)
  ]);
  res.json({
    success: true,
    orders: orders.map((order) => ({
      ...order.toJSON(),
      allowedNextStatuses: getAllowedOrderTransitions(order.orderStatus)
    })),
    totalOrders,
    currentPage: page,
    totalPages: Math.ceil(totalOrders / limit)
  });
});

export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { orderStatus, notes } = req.body || {};
  if (!isKnownOrderStatus(orderStatus)) throw httpError(400, 'Invalid order status.');
  const session = await mongoose.startSession();
  let order;
  try {
    await session.withTransaction(async () => {
      order = await Order.findById(req.params.id).session(session);
      if (!order) throw httpError(404, 'Order not found.');
      if (!canTransitionOrderStatus(order.orderStatus, orderStatus)) throw httpError(409, `Order cannot move from ${order.orderStatus} to ${orderStatus}.`);
      if (orderStatus === 'Cancelled' && ['Confirmed', 'Pending', 'Processing'].includes(order.orderStatus)) {
        for (const item of order.items) await Product.updateOne({ _id: item.product }, { $inc: { stock: item.quantity } }, { session });
      }
      if (orderStatus !== order.orderStatus) {
        order.orderStatus = orderStatus;
        order.statusHistory.push({ status: orderStatus, changedBy: req.user._id, reason: String(notes || '').slice(0, 300) });
      }
      if (notes !== undefined) order.notes = String(notes).slice(0, 1000);
      await order.save({ session });
    });
  } finally { await session.endSession(); }
  res.json({ success: true, message: 'Order updated successfully.', order });
});
