import mongoose from 'mongoose';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import User from '../models/User.js';
import { asyncHandler, httpError } from '../utils/http.js';
import { paiseToCatalogUnits } from '../utils/money.js';
export const getDashboardStats = asyncHandler(async (_req, res) => {
  const [totalProducts, totalOrders, totalCustomers, pendingOrders, lowStockProducts, deliveredOrders, recentOrders, paidOrders, categoryDistribution] = await Promise.all([
    Product.countDocuments({ active: { $ne: false } }), Order.countDocuments(), User.countDocuments({ role: 'customer' }),
    Order.countDocuments({ orderStatus: { $in: ['Pending', 'Confirmed', 'Processing'] } }),
    Product.countDocuments({ active: { $ne: false }, stock: { $lte: 10 } }), Order.countDocuments({ orderStatus: 'Delivered' }),
    Order.find().sort({ createdAt: -1 }).limit(5).populate('customer', 'name email'),
    Order.find({ paymentStatus: 'Paid' }).select('totalPaise createdAt'),
    Product.aggregate([{ $match: { active: { $ne: false } } }, { $group: { _id: '$category', count: { $sum: 1 } } }])
  ]);
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const chart = {};
  const now = new Date();
  for (let i = 5; i >= 0; i--) { const d = new Date(now.getFullYear(), now.getMonth() - i, 1); chart[`${d.getFullYear()}-${d.getMonth()}`] = { month: monthNames[d.getMonth()], revenue: 0, orders: 0 }; }
  for (const order of paidOrders) { const d = new Date(order.createdAt); const row = chart[`${d.getFullYear()}-${d.getMonth()}`]; if (row) { row.revenue += paiseToCatalogUnits(order.totalPaise); row.orders += 1; } }
  const totalRevenuePaise = paidOrders.reduce((sum, order) => sum + order.totalPaise, 0);
  res.json({ success: true, stats: { totalProducts, totalOrders, totalCustomers, totalRevenue: paiseToCatalogUnits(totalRevenuePaise), pendingOrders, lowStockProducts, deliveredOrders }, chartData: Object.values(chart), categoryDistribution: categoryDistribution.map((x) => ({ name: x._id, count: x.count })), recentOrders });
});
export const getCustomers = asyncHandler(async (req, res) => {
  const users = await User.find({ role: 'customer' }).sort({ createdAt: -1 }).select('name email phone status createdAt');
  const ids = users.map((user) => user._id);
  const totals = await Order.aggregate([
    { $match: { customer: { $in: ids } } },
    { $group: { _id: '$customer', orderCount: { $sum: 1 }, totalSpentPaise: { $sum: { $cond: [{ $eq: ['$paymentStatus', 'Paid'] }, '$totalPaise', 0] } } } }
  ]);
  const byUser = new Map(totals.map((row) => [String(row._id), row]));
  res.json({ success: true, customers: users.map((user) => { const row = byUser.get(String(user._id)); return { _id: user._id, name: user.name, email: user.email, phone: user.phone, status: user.status, createdAt: user.createdAt, orderCount: row?.orderCount || 0, totalSpent: paiseToCatalogUnits(row?.totalSpentPaise || 0) }; }) });
});
export const updateCustomerStatus = asyncHandler(async (req, res) => {
  if (!['active', 'blocked'].includes(req.body?.status)) throw httpError(400, 'Customer status must be active or blocked.');
  if (!mongoose.isValidObjectId(req.params.id)) throw httpError(404, 'Customer not found.');
  const user = await User.findOne({ _id: req.params.id, role: 'customer' });
  if (!user) throw httpError(404, 'Customer not found.');
  user.status = req.body.status;
  await user.save();
  if (user.status === 'blocked') await (await import('../models/Session.js')).default.updateMany({ user: user._id, revokedAt: null }, { $set: { revokedAt: new Date() } });
  res.json({ success: true, message: `Customer account status updated to ${user.status}.`, user: { id: user._id, name: user.name, email: user.email, status: user.status } });
});
