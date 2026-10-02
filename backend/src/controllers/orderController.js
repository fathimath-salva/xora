import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Cart from '../models/Cart.js';

export const createOrder = async (req, res, next) => {
  try {
    const { items, shippingAddress, paymentMethod, notes } = req.body;

    if (!items || items.length === 0) {
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

    // Verify each product and calculate prices
    let subtotal = 0;
    const validatedItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product "${item.name}" no longer exists.`
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}. Available: ${product.stock}`
        });
      }

      const effectivePrice = product.discountPrice ? product.discountPrice : product.price;
      subtotal += effectivePrice * item.quantity;

      validatedItems.push({
        product: product._id,
        name: product.name,
        image: item.image || product.images[0],
        price: effectivePrice,
        quantity: item.quantity,
        size: item.size || 'M',
        colour: item.colour || 'Default'
      });

      // Deduct stock
      product.stock -= item.quantity;
      await product.save();
    }

    // Shipping policy thresholds use the existing catalog currency units.
    const shippingFee = subtotal >= 200 ? 0 : 15;
    const tax = Math.round(subtotal * 0.08 * 100) / 100; // 8% estimated luxury sales tax
    const total = subtotal + shippingFee + tax;

    const order = await Order.create({
      customer: req.user._id,
      items: validatedItems,
      shippingAddress,
      paymentMethod: paymentMethod || 'Test/Mock Online Payment',
      paymentStatus: 'Pending',
      orderStatus: 'Confirmed', // Immediately confirmed on order placement
      subtotal,
      shippingFee,
      tax,
      total,
      notes: notes || ''
    });

    // Clear customer cart upon order placement
    await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });

    res.status(201).json({
      success: true,
      message: 'Order placed successfully.',
      order
    });
  } catch (error) {
    next(error);
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
  try {
    const { orderStatus, paymentStatus, notes } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found.'
      });
    }

    if (orderStatus) {
      // If order is cancelled, restore inventory
      if (orderStatus === 'Cancelled' && order.orderStatus !== 'Cancelled') {
        for (const item of order.items) {
          await Product.findByIdAndUpdate(item.product, {
            $inc: { stock: item.quantity }
          });
        }
      }
      order.orderStatus = orderStatus;
    }

    if (paymentStatus) {
      order.paymentStatus = paymentStatus;
    }

    if (notes !== undefined) {
      order.notes = notes;
    }

    await order.save();

    res.status(200).json({
      success: true,
      message: 'Order updated successfully.',
      order
    });
  } catch (error) {
    next(error);
  }
};
