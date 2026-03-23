import { Request, Response } from 'express';
import User from '../models/User.js';

export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        customerId: user.customerId,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : String(error) });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { name, email } = req.body;

    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if email already exists (and is not their own)
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already in use' });
      }
    }

    if (name) user.name = name;
    if (email) user.email = email;

    await user.save();

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : String(error) });
  }
};

export const getAllCustomers = async (req: Request, res: Response) => {
  try {
    const userRole = req.userRole;

    // Only admins can view all customers
    if (userRole !== 'admin') {
      return res.status(403).json({ message: 'Forbidden: Admin access required' });
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string || '';
    const skip = (page - 1) * limit;

    const searchQuery = search
      ? { $or: [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }] }
      : {};

    const customers = await User.find({ role: 'customer', ...searchQuery })
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments({ role: 'customer', ...searchQuery });

    res.json({
      customers,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: page,
        limit,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : String(error) });
  }
};

export const getCustomerById = async (req: Request, res: Response) => {
  try {
    const userRole = req.userRole;

    // Only admins can view customer details
    if (userRole !== 'admin') {
      return res.status(403).json({ message: 'Forbidden: Admin access required' });
    }

    const { id } = req.params;

    const customer = await User.findById(id).select('-password');
    
    if (!customer || customer.role !== 'customer') {
      return res.status(404).json({ message: 'Customer not found' });
    }

    res.json({ customer });
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : String(error) });
  }
};

export const updateCustomerStatus = async (req: Request, res: Response) => {
  try {
    const userRole = req.userRole;

    // Only admins can update customer status
    if (userRole !== 'admin') {
      return res.status(403).json({ message: 'Forbidden: Admin access required' });
    }

    const { id } = req.params;
    const { isActive } = req.body;

    const customer = await User.findById(id);
    
    if (!customer || customer.role !== 'customer') {
      return res.status(404).json({ message: 'Customer not found' });
    }

    customer.isActive = isActive;
    await customer.save();

    res.json({
      message: 'Customer status updated',
      customer: {
        id: customer._id,
        name: customer.name,
        email: customer.email,
        isActive: customer.isActive,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : String(error) });
  }
};

export const deleteCustomer = async (req: Request, res: Response) => {
  try {
    const userRole = req.userRole;

    // Only admins can delete customers
    if (userRole !== 'admin') {
      return res.status(403).json({ message: 'Forbidden: Admin access required' });
    }

    const { id } = req.params;

    const customer = await User.findById(id);
    
    if (!customer || customer.role !== 'customer') {
      return res.status(404).json({ message: 'Customer not found' });
    }

    await User.findByIdAndDelete(id);

    res.json({ message: 'Customer deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : String(error) });
  }
};
