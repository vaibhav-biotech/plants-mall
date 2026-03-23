import { Request, Response } from 'express';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';

// Helper function to generate unique customer ID
function generateCustomerId(): string {
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2);
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const randomNum = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
  return `${year}${month}${randomNum}`;
}

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const customerId = generateCustomerId();
    const user = await User.create({ name, email, password, customerId, role: role || 'customer' });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'secret_key',
      { expiresIn: '7d' } as any
    );

    res.status(201).json({
      message: 'User registered successfully',
      user: { id: user._id, name: user.name, email: user.email, customerId: user.customerId, role: user.role },
      token,
    });
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : String(error) });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'secret_key',
      { expiresIn: '7d' } as any
    );

    res.json({
      message: 'Login successful',
      user: { id: user._id, name: user.name, email: user.email, customerId: user.customerId, role: user.role },
      token,
    });
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : String(error) });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Please provide email address' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if user exists for security
      return res.status(200).json({
        message: 'If an account with this email exists, a reset link has been sent',
      });
    }

    // Generate reset token
    const resetToken = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || 'secret_key',
      { expiresIn: '1h' } as any
    );

    // TODO: Send email with reset link using Zepto
    // Email should contain: resetUrl = `${process.env.FRONTEND_URL}/auth/reset-password?token=${resetToken}`
    console.log('[TODO] Send password reset email to:', email);
    console.log('[TODO] Reset token:', resetToken);

    res.status(200).json({
      message: 'If an account with this email exists, a reset link has been sent',
      // In development, return token (remove in production)
      ...(process.env.NODE_ENV === 'development' && { resetToken }),
    });
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : String(error) });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ message: 'Token and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    // Verify token
    let decoded: any;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key');
    } catch (err) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update password
    user.password = password;
    await user.save();

    res.json({
      message: 'Password reset successfully',
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : String(error) });
  }
};
