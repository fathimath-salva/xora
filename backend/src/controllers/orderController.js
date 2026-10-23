import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Cart from '../models/Cart.js';

class OrderRequestError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export const createOrder = async (req, res, next) => {
  const session = await Order.startSession();
  try {
    const { items, shippingAddress, paymentMethod, notes } = req.body;
    const idempotencyKey = req.get('Idempotency-Key');
    if (!idempotencyKey) {
      return res.status(400).json({ success: false, message: 'A checkout request key is required. Please retry checkout.' });
    }
    if (idempotencyKey && !/^[A-Za-z0-9_-]{16,100}$/.test(idempotencyKey)) {
      return res.status(400).json({ success: false, message: 'Invalid checkout request key.' });
    }
    if (idempotencyKey) {
      const priorOrder = await Order.findOne({ customer: req.user._id, idempotencyKey });
      if (priorOrder) return res.status(200).json({ success: true, message: 'This checkout was already completed.', order: priorOrder });
    }

    if (!Array.isArray(items) || items.length === 0 || items.length > 50) {
      return res.status(400).json({
        success: false,
        message: 'No items in order.'
      });
    }

    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.addressLine1 || !shippingAddress.city) {
      return res.status(400).json({
        success: false,
        message: 'Please provide full shipping details.'
      });
    }
    if (!/^\d{6}$/.test(String(shippingAddress.postalCode || '')) || !/^\d{10}$/.test(String(shippingAddress.phone || '').replace(/\D/g, ''))) {
      return res.status(400).json({ success: false, message: 'Enter a valid 6-digit PIN code and 10-digit phone number.' });
    }

    let order;
    await session.withTransaction(async () => {
      let subtotal = 0;
      const validatedItems = [];

      for (const item of items) {
        if (!item || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 20) {
          throw new OrderRequestError(400, 'Each item quantity must be a whole number between 1 and 20.');
        }
        const product = await Product.findById(item.product).session(session);
        if (!product || product.active !== true || !['men', 'unisex'].includes(product.gender)) {
          throw new OrderRequestError(404, `Product "${item.name}" is no longer available.`);
        }

        const selectedSize = String(item.size || '');
        if (product.sizes?.length && !product.sizes.includes(selectedSize)) {
          throw new OrderRequestError(400, `Please select a valid size for ${product.name}.`);
        }
        if (!product.sizes?.length && selectedSize && selectedSize !== 'N/A') {
          throw new OrderRequestError(400, `${product.name} does not accept a size selection.`);
        }

        // Conditional update prevents simultaneous orders from taking stock below zero.
        const reserved = await Product.findOneAndUpdate(
          { _id: product._id, stock: { $gte: item.quantity }, ...(selectedSize ? { sizes: selectedSize } : {}) },
          { $inc: { stock: -item.quantity } },
          { new: true, session }
        );
        if (!reserved) throw new OrderRequestError(400, `Insufficient stock or the selected size is unavailable for ${product.name}.`);

        const effectivePrice = product.discountPrice ? product.discountPrice : product.price;
        subtotal += effectivePrice * item.quantity;
        validatedItems.push({
          product: product._id,
          name: product.name,
          image: product.images[0],
          category: product.category,
          price: effectivePrice,
          quantity: item.quantity,
          size: selectedSize || 'N/A',
          colour: item.colour || 'Default'
        });
      }

      // Shipping policy thresholds use the existing catalog currency units.
      const shippingFee = subtotal >= 200 ? 0 : 15;
      const tax = Math.round(subtotal * 0.08 * 100) / 100;
      const total = subtotal + shippingFee + tax;
      [order] = await Order.create([{
        customer: req.user._id,
        ...(idempotencyKey ? { idempotencyKey } : {}),
        items: validatedItems,
        shippingAddress,
        paymentMethod: paymentMethod || 'Test/Mock Online Payment',
        paymentStatus: 'Pending',
        orderStatus: 'Confirmed',
        subtotal,
        shippingFee,
        tax,
        total,
        notes: notes || ''
      }], { session });
      await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] }, { session });
    });

    // Clear customer cart after the order and inventory reservation are committed.
    res.status(201).json({
      success: true,
      message: 'Order placed successfully.',
      order
    });
  } catch (error) {
    if (error.code === 11000 && req.get('Idempotency-Key')) {
      const priorOrder = await Order.findOne({ customer: req.user._id, idempotencyKey: req.get('Idempotency-Key') });
      if (priorOrder) return res.status(200).json({ success: true, message: 'This checkout was already completed.', order: priorOrder });
    }
    if (error instanceof OrderRequestError) return res.status(error.status).json({ success: false, message: error.message });
    next(error);
  } finally {
    await session.endSession();
  }
};

export const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ customer: req.user._id })
      .sort({ createdAt: -1 })
      .populate('customer', 'name email');

    res.status(200).json({
      success: true,
      orders
    });
  } catch (error) {
    next(error);
  }
};

export const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('customer', 'name email phone');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found.'
      });
    }

    // Ensure only the customer or an admin can access this order
    const isOwner = order.customer && order.customer._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access to this order.'
      });
    }

    res.status(200).json({
      success: true,
      order
    });
  } catch (error) {
    next(error);
  }
};

export const getAllOrders = async (req, res, next) => {
  try {
    const { status, search, page = 1, limit = 50 } = req.query;
    const query = {};

    if (status && status !== 'all') {
      query.orderStatus = status;
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const [orders, totalOrders] = await Promise.all([
      Order.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .populate('customer', 'name email phone'),
      Order.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      orders,
      totalOrders,
      currentPage: pageNum,
      totalPages: Math.ceil(totalOrders / limitNum)
    });
  } catch (error) {
    next(error);
  }
};

export const updateOrderStatus = async (req, res, next) => {
  const session = await Order.startSession();
  try {
    const { orderStatus, paymentStatus, notes } = req.body;
    let order;
    let alreadyCancelled = false;
    await session.withTransaction(async () => {
      order = await Order.findById(req.params.id).session(session);
      if (!order) throw new OrderRequestError(404, 'Order not found.');
      if (orderStatus && !['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].includes(orderStatus)) {
        throw new OrderRequestError(400, 'Invalid order status.');
      }
      if (order.orderStatus === 'Cancelled' && orderStatus && orderStatus !== 'Cancelled') {
        throw new OrderRequestError(400, 'A cancelled order cannot be reopened.');
      }
      if (orderStatus === 'Cancelled' && order.orderStatus !== 'Cancelled') {
        for (const item of order.items) {
          await Product.updateOne({ _id: item.product }, { $inc: { stock: item.quantity } }, { session });
        }
        order.orderStatus = 'Cancelled';
      } else if (orderStatus === 'Cancelled') {
        alreadyCancelled = true;
      } else if (orderStatus) {
        order.orderStatus = orderStatus;
      }
      if (paymentStatus) order.paymentStatus = paymentStatus;
      if (notes !== undefined) order.notes = notes;
      await order.save({ session });
    });

    res.status(200).json({
      success: true,
      message: alreadyCancelled ? 'Order already cancelled.' : 'Order updated successfully.',
      order
    });
  } catch (error) {
    if (error instanceof OrderRequestError) return res.status(error.status).json({ success: false, message: error.message });
    next(error);
  } finally {
    await session.endSession();
  }
};
