import { Request, Response } from 'express';
import Wishlist from '../models/Wishlist.js';
import Product from '../models/Product.js';

export const addToWishlist = async (req: Request, res: Response) => {
  try {
    const { productId } = req.body;
    const userId = (req as any).userId;

    if (!productId) {
      return res.status(400).json({ message: 'Product ID is required' });
    }

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if already in wishlist
    const existingWishlist = await Wishlist.findOne({ userId, productId });
    if (existingWishlist) {
      return res.status(400).json({ message: 'Product already in wishlist' });
    }

    const wishlist = await Wishlist.create({ userId, productId });

    res.status(201).json({
      message: 'Added to wishlist',
      wishlist,
    });
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : String(error) });
  }
};

export const getWishlist = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    const wishlist = await Wishlist.find({ userId })
      .populate('productId')
      .sort({ createdAt: -1 });

    res.json({
      message: 'Wishlist fetched successfully',
      wishlist,
    });
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : String(error) });
  }
};

export const removeFromWishlist = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    const userId = (req as any).userId;

    const wishlist = await Wishlist.findOneAndDelete({ userId, productId });
    if (!wishlist) {
      return res.status(404).json({ message: 'Item not found in wishlist' });
    }

    res.json({
      message: 'Removed from wishlist',
    });
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : String(error) });
  }
};

export const checkInWishlist = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    const userId = (req as any).userId;

    const wishlist = await Wishlist.findOne({ userId, productId });

    res.json({
      inWishlist: !!wishlist,
    });
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : String(error) });
  }
};
