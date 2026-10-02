import Product from '../models/Product.js';
import Order from '../models/Order.js';
import User from '../models/User.js';

export const getDashboardStats = async (req, res, next) => {
  try {
    const [
      totalProducts,
      totalOrders,
      totalCustomers,
      pendingOrders,
      lowStockProducts,
      deliveredOrders,
      recentOrders,
      orders
    ] = await Promise.all([
      Product.countDocuments(),
      Order.countDocuments(),
      User.countDocuments({ role: 'customer' }),
      Order.countDocuments({ orderStatus: 'Pending' }),
      Product.countDocuments({ stock: { $lte: 10 } }),
      Order.countDocuments({ orderStatus: 'Delivered' }),
      Order.find().sort({ createdAt: -1 }).limit(5).populate('customer', 'name email'),
      Order.find({ orderStatus: { $ne: 'Cancelled' } }).select('total createdAt items')
    ]);

    const totalRevenue = orders.reduce((acc, order) => acc + (order.total || 0), 0);

    // Group sales by month or recent dates for charts
    const monthlySales = {};
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Initialize default recent months
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${monthNames[d.getMonth()]}`;
      monthlySales[key] = { month: key, revenue: 0, orders: 0 };
    }

    orders.forEach((order) => {
      const orderDate = new Date(order.createdAt);
      const key = monthNames[orderDate.getMonth()];
      if (monthlySales[key]) {
        monthlySales[key].revenue += Math.round(order.total || 0);
        monthlySales[key].orders += 1;
      }
    });

    const chartData = Object.values(monthlySales);

    // Category distribution
    const categoryAgg = await Product.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalProducts,
        totalOrders,
        totalCustomers,
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        pendingOrders,
        lowStockProducts,
        deliveredOrders
      },
      chartData,
      categoryDistribution: categoryAgg.map(c => ({ name: c._id, count: c.count })),
      recentOrders
    });
  } catch (error) {
    next(error);
  }
};

export const getCustomers = async (req, res, next) => {
  try {
    const customers = await User.find({ role: 'customer' }).sort({ createdAt: -1 });

    const enrichedCustomers = await Promise.all(
      customers.map(async (cust) => {
        const orders = await Order.find({ customer: cust._id });
        const totalSpent = orders
          .filter((o) => o.orderStatus !== 'Cancelled')
          .reduce((sum, o) => sum + (o.total || 0), 0);

        return {
          _id: cust._id,
          name: cust.name,
          email: cust.email,
          phone: cust.phone,
          status: cust.status || 'active',
          createdAt: cust.createdAt,
          orderCount: orders.length,
          totalSpent: Math.round(totalSpent * 100) / 100
        };
      })
    );

    res.status(200).json({
      success: true,
      customers: enrichedCustomers
    });
  } catch (error) {
    next(error);
  }
};

export const updateCustomerStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found.'
      });
    }

    if (user.role === 'admin') {
      return res.status(400).json({
        success: false,
        message: 'Cannot change status of an administrator.'
      });
    }

    user.status = status;
    await user.save();

    res.status(200).json({
      success: true,
      message: `Customer account status updated to ${status}.`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        status: user.status
      }
    });
  } catch (error) {
    next(error);
  }
};
