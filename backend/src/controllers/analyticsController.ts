import { Request, Response } from 'express';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import Category from '../models/Category.js';

// ===== SALES ANALYTICS =====

export const getSalesOverview = async (req: Request, res: Response) => {
  try {
    // Get all orders (all time, not just last 30 days)
    const allOrders = await Order.find().exec();
    
    // Calculate total revenue from ALL orders
    const totalRevenue = allOrders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);
    
    const totalOrders = allOrders.length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Orders by status (updated with new status names)
    const ordersByStatus = {
      placed: allOrders.filter((o) => o.status === 'placed').length,
      confirmed: allOrders.filter((o) => o.status === 'confirmed').length,
      processing: allOrders.filter((o) => o.status === 'processing').length,
      shipping: allOrders.filter((o) => o.status === 'shipping').length,
      transit: allOrders.filter((o) => o.status === 'transit').length,
      delivered: allOrders.filter((o) => o.status === 'delivered').length,
      cancelled: allOrders.filter((o) => o.status === 'cancelled').length,
    };

    // Orders by payment status
    const ordersByPaymentStatus = {
      pending: allOrders.filter((o) => o.paymentStatus === 'pending').length,
      completed: allOrders.filter((o) => o.paymentStatus === 'completed').length,
      failed: allOrders.filter((o) => o.paymentStatus === 'failed').length,
    };

    res.json({
      success: true,
      totalOrders,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      avgOrderValue: Math.round(avgOrderValue * 100) / 100,
      ordersByStatus,
      ordersByPaymentStatus,
    });
  } catch (error) {
    console.error('Error in getSalesOverview:', error);
    res.status(500).json({ success: false, message: 'Error fetching sales overview' });
  }
};

export const getSalesTrend = async (req: Request, res: Response) => {
  try {
    const { months = 6 } = req.query;
    const numMonths = parseInt(months as string) || 6;

    // Get orders from last N months
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - numMonths);

    const orders = await Order.find({
      createdAt: { $gte: startDate },
    }).exec();

    // Group by month
    const monthData: { [key: string]: { orders: number; revenue: number } } = {};

    orders.forEach((order) => {
      const month = order.createdAt.toISOString().slice(0, 7); // YYYY-MM
      if (!monthData[month]) {
        monthData[month] = { orders: 0, revenue: 0 };
      }
      monthData[month].orders += 1;
      monthData[month].revenue += order.totalPrice;
    });

    const trend = Object.entries(monthData)
      .map(([month, data]) => ({
        month,
        orders: data.orders,
        revenue: Math.round(data.revenue * 100) / 100,
      }))
      .sort((a, b) => a.month.localeCompare(b.month));

    res.json({ success: true, trend });
  } catch (error) {
    console.error('Error in getSalesTrend:', error);
    res.status(500).json({ success: false, message: 'Error fetching sales trend' });
  }
};

export const getTopProducts = async (req: Request, res: Response) => {
  try {
    const { limit = 10, startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), endDate = new Date() } = req.query;
    const numLimit = parseInt(limit as string) || 10;

    const start = new Date(startDate as string);
    const end = new Date(endDate as string);

    // Get orders
    const orders = await Order.find({
      createdAt: { $gte: start, $lte: end },
    }).exec();

    // Aggregate product sales
    const productSales: { [key: string]: { name: string; units: number; revenue: number; discount: number } } = {};

    orders.forEach((order) => {
      order.items.forEach((item: any) => {
        const productId = item.productId.toString();
        if (!productSales[productId]) {
          productSales[productId] = {
            name: item.name || 'Unknown',
            units: 0,
            revenue: 0,
            discount: 0,
          };
        }
        productSales[productId].units += item.quantity;
        productSales[productId].revenue += item.quantity * item.price;
        productSales[productId].discount += (item.quantity * item.price * (item.discount || 0)) / 100;
      });
    });

    const products = Object.entries(productSales)
      .map(([productId, data]) => ({
        productId,
        name: data.name,
        unitsSold: data.units,
        revenue: Math.round(data.revenue * 100) / 100,
        discount: Math.round(data.discount * 100) / 100,
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, numLimit);

    res.json({ success: true, products });
  } catch (error) {
    console.error('Error in getTopProducts:', error);
    res.status(500).json({ success: false, message: 'Error fetching top products' });
  }
};

// ===== PRODUCT ANALYTICS =====

export const getProductSummary = async (req: Request, res: Response) => {
  try {
    const totalProducts = await Product.countDocuments();
    const activeProducts = await Product.countDocuments({ isActive: true });
    const inactiveProducts = await Product.countDocuments({ isActive: false });
    const outOfStockProducts = await Product.countDocuments({ stock: 0, isActive: true });

    // Calculate inventory value
    const allProducts = await Product.find().select('stock price').exec();
    const inventoryValue = allProducts.reduce((sum, p) => sum + (p.stock * (p.price || 0)), 0);

    res.json({
      success: true,
      totalProducts,
      activeProducts,
      inactiveProducts,
      outOfStockProducts,
      inventoryValue: Math.round(inventoryValue * 100) / 100,
    });
  } catch (error) {
    console.error('Error in getProductSummary:', error);
    res.status(500).json({ success: false, message: 'Error fetching product summary' });
  }
};

export const getLowStockProducts = async (req: Request, res: Response) => {
  try {
    const { threshold = 10 } = req.query;
    const numThreshold = parseInt(threshold as string) || 10;

    const products = await Product.find({
      stock: { $lt: numThreshold, $gt: 0 },
      isActive: true,
    })
      .select('name stock price')
      .sort({ stock: 1 })
      .limit(20)
      .exec();

    const data = products.map((p) => ({
      productId: p._id,
      name: p.name,
      currentStock: p.stock,
      minStock: numThreshold,
      value: Math.round(p.stock * (p.price || 0) * 100) / 100,
    }));

    res.json({ success: true, products: data });
  } catch (error) {
    console.error('Error in getLowStockProducts:', error);
    res.status(500).json({ success: false, message: 'Error fetching low stock products' });
  }
};

export const getCategoryPerformance = async (req: Request, res: Response) => {
  try {
    const { months = 1 } = req.query;
    const numMonths = parseInt(months as string) || 1;

    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - numMonths);

    // Get orders
    const orders = await Order.find({
      createdAt: { $gte: startDate },
    }).exec();

    // Group by category
    const categoryData: {
      [key: string]: { revenue: number; orders: number; products: Set<string> };
    } = {};

    orders.forEach((order) => {
      order.items.forEach((item: any) => {
        const category = item.category || 'Uncategorized';
        if (!categoryData[category]) {
          categoryData[category] = { revenue: 0, orders: 0, products: new Set() };
        }
        categoryData[category].revenue += item.quantity * item.price;
        categoryData[category].products.add(item.productId.toString());
      });
    });

    const categories = Object.entries(categoryData)
      .map(([name, data]) => ({
        name,
        revenue: Math.round(data.revenue * 100) / 100,
        ordersCount: data.orders || Object.keys(categoryData).length,
        productCount: data.products.size,
      }))
      .sort((a, b) => b.revenue - a.revenue);

    res.json({ success: true, categories });
  } catch (error) {
    console.error('Error in getCategoryPerformance:', error);
    res.status(500).json({ success: false, message: 'Error fetching category performance' });
  }
};

// ===== CUSTOMER ANALYTICS =====

export const getCustomerSummary = async (req: Request, res: Response) => {
  try {
    const totalCustomers = await User.countDocuments({ role: 'customer' });
    const newCustomers = await User.countDocuments({
      role: 'customer',
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
    });

    // Active customers = those with at least 1 order
    const customersWithOrders = await Order.distinct('userId');
    const activeCustomers = customersWithOrders.length;

    // Repeat customers
    const orderCounts: { [key: string]: number } = {};
    const allOrders = await Order.find({ userId: { $ne: null } }).select('userId').exec();
    allOrders.forEach((order) => {
      const userId = order.userId?.toString() || '';
      orderCounts[userId] = (orderCounts[userId] || 0) + 1;
    });
    const repeatingCustomers = Object.values(orderCounts).filter((count) => count > 1).length;

    // Average customer lifetime value
    const customers = await Order.aggregate([
      { $match: { userId: { $ne: null } } },
      {
        $group: {
          _id: '$userId',
          totalSpent: { $sum: '$totalPrice' },
        },
      },
    ]).exec();

    const avgLifetimeValue = customers.length > 0 
      ? customers.reduce((sum, c) => sum + c.totalSpent, 0) / customers.length 
      : 0;

    res.json({
      success: true,
      totalCustomers,
      newCustomers,
      activeCustomers,
      repeatingCustomers,
      repeatPurchaseRate: totalCustomers > 0 ? Math.round((repeatingCustomers / totalCustomers) * 10000) / 100 : 0,
      avgCustomerLifetimeValue: Math.round(avgLifetimeValue * 100) / 100,
    });
  } catch (error) {
    console.error('Error in getCustomerSummary:', error);
    res.status(500).json({ success: false, message: 'Error fetching customer summary' });
  }
};

export const getTopCustomers = async (req: Request, res: Response) => {
  try {
    const { limit = 10 } = req.query;
    const numLimit = parseInt(limit as string) || 10;

    // Aggregate customer spending
    const customers = await Order.aggregate([
      { $match: { userId: { $ne: null } } },
      {
        $group: {
          _id: '$userId',
          totalSpent: { $sum: '$total' },
          orderCount: { $sum: 1 },
          lastOrderDate: { $max: '$createdAt' },
        },
      },
      { $sort: { totalSpent: -1 } },
      { $limit: numLimit },
    ]).exec();

    // Get user details
    const topCustomers = await Promise.all(
      customers.map(async (c) => {
        const user = await User.findById(c._id).select('name email customerId').exec();
        return {
          customerId: user?.customerId || c._id,
          name: user?.name || 'Unknown',
          email: user?.email || 'N/A',
          totalSpent: Math.round(c.totalSpent * 100) / 100,
          orderCount: c.orderCount,
          lastOrder: c.lastOrderDate,
        };
      })
    );

    res.json({ success: true, customers: topCustomers });
  } catch (error) {
    console.error('Error in getTopCustomers:', error);
    res.status(500).json({ success: false, message: 'Error fetching top customers' });
  }
};

// ===== FINANCIAL ANALYTICS =====

export const getFinancialSummary = async (req: Request, res: Response) => {
  try {
    // Get ALL orders (all time)
    const orders = await Order.find().exec();

    const totalRevenue = orders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
    const totalDiscount = orders.reduce((sum, o) => {
      const discount = o.items.reduce((itemSum: number, item: any) => {
        const discAmount = (item.quantity * item.price * (item.discount || 0)) / 100;
        return itemSum + discAmount;
      }, 0);
      return sum + discount;
    }, 0);

    const paymentStatus = {
      completed: { count: 0, amount: 0 },
      pending: { count: 0, amount: 0 },
      failed: { count: 0, amount: 0 },
    };

    orders.forEach((order) => {
      const status = order.paymentStatus;
      if (paymentStatus[status as keyof typeof paymentStatus]) {
        paymentStatus[status as keyof typeof paymentStatus].count += 1;
        paymentStatus[status as keyof typeof paymentStatus].amount += order.totalPrice || 0;
      }
    });

    res.json({
      success: true,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      totalDiscount: Math.round(totalDiscount * 100) / 100,
      netRevenue: Math.round((totalRevenue - totalDiscount) * 100) / 100,
      avgOrderValue: orders.length > 0 ? Math.round((totalRevenue / orders.length) * 100) / 100 : 0,
      paymentStatus: {
        completed: {
          count: paymentStatus.completed.count,
          amount: Math.round(paymentStatus.completed.amount * 100) / 100,
        },
        pending: {
          count: paymentStatus.pending.count,
          amount: Math.round(paymentStatus.pending.amount * 100) / 100,
        },
        failed: {
          count: paymentStatus.failed.count,
          amount: Math.round(paymentStatus.failed.amount * 100) / 100,
        },
      },
    });
  } catch (error) {
    console.error('Error in getFinancialSummary:', error);
    res.status(500).json({ success: false, message: 'Error fetching financial summary' });
  }
};

// ===== INVENTORY ANALYTICS =====

export const getInventorySummary = async (req: Request, res: Response) => {
  try {
    const products = await Product.find({ isActive: true }).select('stock price').exec();

    const totalStockValue = products.reduce((sum, p) => sum + (p.stock * (p.price || 0)), 0);
    const lowStockCount = products.filter((p) => p.stock > 0 && p.stock < 10).length;
    const outOfStockCount = products.filter((p) => p.stock === 0).length;

    res.json({
      success: true,
      totalStockValue: Math.round(totalStockValue * 100) / 100,
      lowStockItems: lowStockCount,
      outOfStockItems: outOfStockCount,
      totalItems: products.length,
    });
  } catch (error) {
    console.error('Error in getInventorySummary:', error);
    res.status(500).json({ success: false, message: 'Error fetching inventory summary' });
  }
};

// ===== ORDER ANALYTICS =====

export const getOrderSummary = async (req: Request, res: Response) => {
  try {
    const allOrders = await Order.find().exec();

    const summary = {
      totalOrders: allOrders.length,
      placed: allOrders.filter((o) => o.status === 'placed').length,
      confirmed: allOrders.filter((o) => o.status === 'confirmed').length,
      processing: allOrders.filter((o) => o.status === 'processing').length,
      shipping: allOrders.filter((o) => o.status === 'shipping').length,
      transit: allOrders.filter((o) => o.status === 'transit').length,
      delivered: allOrders.filter((o) => o.status === 'delivered').length,
      cancelled: allOrders.filter((o) => o.status === 'cancelled').length,
    };

    res.json({ success: true, ...summary });
  } catch (error) {
    console.error('Error in getOrderSummary:', error);
    res.status(500).json({ success: false, message: 'Error fetching order summary' });
  }
};

export const getDailyOrderTrend = async (req: Request, res: Response) => {
  try {
    const { days = 30 } = req.query;
    const numDays = parseInt(days as string) || 30;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - numDays);

    const orders = await Order.find({
      createdAt: { $gte: startDate },
    }).exec();

    // Group by day
    const dayData: { [key: string]: { orders: number; revenue: number } } = {};

    orders.forEach((order) => {
      const day = order.createdAt.toISOString().slice(0, 10); // YYYY-MM-DD
      if (!dayData[day]) {
        dayData[day] = { orders: 0, revenue: 0 };
      }
      dayData[day].orders += 1;
      dayData[day].revenue += order.totalPrice;
    });

    const trend = Object.entries(dayData)
      .map(([date, data]) => ({
        date,
        orders: data.orders,
        revenue: Math.round(data.revenue * 100) / 100,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    res.json({ success: true, trend });
  } catch (error) {
    console.error('Error in getDailyOrderTrend:', error);
    res.status(500).json({ success: false, message: 'Error fetching daily order trend' });
  }
};
