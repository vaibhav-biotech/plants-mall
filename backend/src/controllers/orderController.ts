import { Request, Response } from 'express';
import Order from '../models/Order.js';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Invoice from '../models/Invoice.js';

export const getMyOrders = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, status = '', search = '' } = req.query;
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Get user details to match by email too
    const user = await User.findById(userId);

    const filter: any = {
      $or: [
        { userId },
        { customerEmail: user?.email }
      ]
    };

    if (status) {
      filter.status = status;
    }

    if (search) {
      filter.orderNumber = { $regex: search, $options: 'i' };
    }

    const total = await Order.countDocuments(filter);
    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    res.json({
      orders,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
};

export const getAllOrders = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, status = '', search = '' } = req.query;
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    const filter: any = {};

    if (status) {
      filter.status = status;
    }

    if (search) {
      filter.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { customerName: { $regex: search, $options: 'i' } },
        { customerEmail: { $regex: search, $options: 'i' } },
        { customerPhone: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await Order.countDocuments(filter);
    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    res.json({
      orders,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
};

export const getOrderById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch order' });
  }
};

export const createOrder = async (req: Request, res: Response) => {
  try {
    const {
      customerName,
      customerEmail,
      customerPhone,
      items,
      totalPrice,
      subtotal,
      taxAmount,
      discountAmount,
      paymentMethod,
      shippingAddress,
      notes,
    } = req.body;

    // Validate required fields
    if (!customerName || !customerEmail || !customerPhone || !items || !totalPrice || !paymentMethod || !shippingAddress) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Order must have at least one item' });
    }

    // Validate and check stock for all items
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ error: `Product ${item.productId} not found` });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({ 
          error: `Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}` 
        });
      }
    }

    // Generate order number
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.floor(Math.random() * 90000) + 10000;
    const orderNumber = `ORD-${dateStr}-${random}`;

    const order = new Order({
      userId: req.userId || undefined,
      orderNumber,
      customerName,
      customerEmail,
      customerPhone,
      items,
      totalPrice,
      subtotal: subtotal || totalPrice,
      taxAmount: taxAmount || 0,
      discountAmount: discountAmount || 0,
      paymentMethod,
      shippingAddress,
      notes: notes || '',
    });

    await order.save();

    // Decrease stock for all items after order is saved
    try {
      for (const item of items) {
        await Product.findByIdAndUpdate(
          item.productId,
          { $inc: { stock: -item.quantity } },
          { new: true }
        );
      }
    } catch (stockError) {
      console.error('Error updating stock:', stockError);
      // Log the issue but don't fail the order
    }

    res.status(201).json(order);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to create order' });
  }
};

export const updateOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      customerName,
      customerEmail,
      customerPhone,
      items,
      totalPrice,
      subtotal,
      taxAmount,
      discountAmount,
      paymentMethod,
      paymentStatus,
      shippingAddress,
      trackingNumber,
      notes,
    } = req.body;

    const updateData: any = {};

    if (customerName) updateData.customerName = customerName;
    if (customerEmail) updateData.customerEmail = customerEmail;
    if (customerPhone) updateData.customerPhone = customerPhone;
    if (items) updateData.items = items;
    if (totalPrice) updateData.totalPrice = totalPrice;
    if (subtotal !== undefined) updateData.subtotal = subtotal;
    if (taxAmount !== undefined) updateData.taxAmount = taxAmount;
    if (discountAmount !== undefined) updateData.discountAmount = discountAmount;
    if (paymentMethod) updateData.paymentMethod = paymentMethod;
    if (paymentStatus) updateData.paymentStatus = paymentStatus;
    if (shippingAddress) updateData.shippingAddress = shippingAddress;
    if (trackingNumber) updateData.trackingNumber = trackingNumber;
    if (notes !== undefined) updateData.notes = notes;

    const order = await Order.findByIdAndUpdate(id, updateData, { new: true });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update order' });
  }
};

export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !['placed', 'confirmed', 'processing', 'shipping', 'transit', 'delivered', 'cancelled'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status value. Must be one of: placed, confirmed, processing, shipping, transit, delivered, cancelled' });
    }

    const order = await Order.findByIdAndUpdate(id, { status }, { new: true });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update order status' });
  }
};

export const updatePaymentStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { paymentStatus } = req.body;

    if (!paymentStatus || !['pending', 'completed', 'failed'].includes(paymentStatus)) {
      return res.status(400).json({ error: 'Invalid payment status value' });
    }

    const order = await Order.findByIdAndUpdate(id, { paymentStatus }, { new: true });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update payment status' });
  }
};

export const confirmOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Only allow confirmation if order is in 'placed' status
    if (order.status !== 'placed') {
      return res.status(400).json({ error: `Order cannot be confirmed. Current status: ${order.status}` });
    }

    // Generate invoice number
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.floor(Math.random() * 90000) + 10000;
    const invoiceNumber = `INV-${dateStr}-${random}`;

    // Create invoice
    const invoice = new Invoice({
      invoiceNumber,
      orderId: order._id,
      userId: order.userId,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      customerPhone: order.customerPhone,
      items: order.items,
      subtotal: order.subtotal,
      taxAmount: order.taxAmount,
      discountAmount: order.discountAmount,
      totalAmount: order.totalPrice,
      shippingAddress: order.shippingAddress,
      paymentMethod: order.paymentMethod,
      notes: order.notes,
      issuedDate: new Date(),
    });

    await invoice.save();

    // Update order status to confirmed and add invoice reference
    order.status = 'confirmed';
    order.invoiceId = invoice._id.toString();
    await order.save();

    res.json({ 
      message: 'Order confirmed and invoice generated',
      order,
      invoice 
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to confirm order' });
  }
};

export const getInvoice = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;

    const invoice = await Invoice.findOne({ orderId });

    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    res.json(invoice);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch invoice' });
  }
};


export const cancelOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Check if user is the owner of the order or is admin
    if (order.userId !== userId && req.userRole !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized to cancel this order' });
    }

    // Only allow cancellation if order is NOT delivered or already cancelled
    if (['delivered', 'cancelled'].includes(order.status)) {
      return res.status(400).json({ error: `Cannot cancel order that is already ${order.status}` });
    }

    // Revert stock for all items in the order
    try {
      for (const item of order.items) {
        await Product.findByIdAndUpdate(
          item.productId,
          { $inc: { stock: item.quantity } },
          { new: true }
        );
      }
    } catch (stockError) {
      console.error('Error reverting stock:', stockError);
      // Continue with cancellation even if stock revert fails
    }

    order.status = 'cancelled';
    await order.save();

    res.json({ message: 'Order cancelled successfully', order });
  } catch (error) {
    res.status(500).json({ error: 'Failed to cancel order' });
  }
};

export const deleteOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const order = await Order.findByIdAndDelete(id);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete order' });
  }
};

export const getOrderStats = async (req: Request, res: Response) => {
  try {
    const stats = await Order.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$totalPrice' },
        },
      },
    ]);

    const totalOrders = await Order.countDocuments();
    const totalRevenue = await Order.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: '$totalPrice' },
        },
      },
    ]);

    res.json({
      totalOrders,
      totalRevenue: totalRevenue[0]?.total || 0,
      statsByStatus: stats,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch order statistics' });
  }
};
