import { Request, Response } from 'express';
import Review from '../models/Review.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';

// Get all reviews for a product
export const getProductReviews = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    const { page = 1, limit = 10, sort = 'recent' } = req.query;
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    let sortOption: any = { createdAt: -1 };
    if (sort === 'rating-high') {
      sortOption = { rating: -1, createdAt: -1 };
    } else if (sort === 'rating-low') {
      sortOption = { rating: 1, createdAt: -1 };
    } else if (sort === 'helpful') {
      sortOption = { helpful: -1, createdAt: -1 };
    }

    const reviews = await Review.find({ productId })
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum)
      .lean();

    const total = await Review.countDocuments({ productId });

    // Calculate rating statistics
    const allReviews = await Review.find({ productId }).lean();
    const ratingStats = {
      average: 0,
      total: allReviews.length,
      distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    };

    if (allReviews.length > 0) {
      const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0);
      ratingStats.average = Math.round((totalRating / allReviews.length) * 10) / 10;

      allReviews.forEach((review) => {
        ratingStats.distribution[review.rating as keyof typeof ratingStats.distribution]++;
      });
    }

    res.json({
      reviews,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum),
      },
      ratingStats,
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
};

// Create a new review
export const createReview = async (req: Request, res: Response) => {
  try {
    const { productId, rating, title, comment } = req.body;
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    if (!productId || !rating || !title || !comment) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Check if user has purchased this product
    const purchase = await Order.findOne({
      userId,
      'items.productId': productId,
      status: { $in: ['confirmed', 'processing', 'shipping', 'delivered'] },
    });

    if (!purchase) {
      return res.status(403).json({ error: 'You can only review products you have purchased' });
    }

    // Check if user already reviewed this product
    const existingReview = await Review.findOne({ productId, userId });
    if (existingReview) {
      return res.status(400).json({ error: 'You have already reviewed this product' });
    }

    // Get user details
    const user = await User.findById(userId);

    const review = new Review({
      productId,
      userId,
      userName: user?.name || 'Anonymous',
      email: user?.email || '',
      rating,
      title,
      comment,
      verified: true,
    });

    await review.save();

    // Update product rating
    await updateProductRating(productId);

    res.status(201).json({
      message: 'Review created successfully',
      review,
    });
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({ error: 'Failed to create review' });
  }
};

// Update a review
export const updateReview = async (req: Request, res: Response) => {
  try {
    const { reviewId } = req.params;
    const { rating, title, comment } = req.body;
    const userId = req.userId;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    if (review.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    if (rating) {
      if (rating < 1 || rating > 5) {
        return res.status(400).json({ error: 'Rating must be between 1 and 5' });
      }
      review.rating = rating;
    }

    if (title) review.title = title;
    if (comment) review.comment = comment;

    await review.save();

    // Update product rating
    await updateProductRating(review.productId);

    res.json({
      message: 'Review updated successfully',
      review,
    });
  } catch (error) {
    console.error('Error updating review:', error);
    res.status(500).json({ error: 'Failed to update review' });
  }
};

// Delete a review
export const deleteReview = async (req: Request, res: Response) => {
  try {
    const { reviewId } = req.params;
    const userId = req.userId;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    if (review.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const productId = review.productId;
    await Review.deleteOne({ _id: reviewId });

    // Update product rating
    await updateProductRating(productId);

    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({ error: 'Failed to delete review' });
  }
};

// Get reviews for user's orders (for account page)
export const getUserReviewableProducts = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Get all confirmed orders for this user
    const orders = await Order.find({
      userId,
      status: { $in: ['confirmed', 'processing', 'shipping', 'delivered'] },
    }).lean();

    const reviewableProducts = [];

    for (const order of orders) {
      for (const item of order.items) {
        const existingReview = await Review.findOne({
          productId: item.productId,
          userId,
        });

        if (!existingReview) {
          const product = await Product.findById(item.productId);
          if (product) {
            reviewableProducts.push({
              productId: item.productId,
              productName: item.productName,
              productImage: product.image,
              orderNumber: order.orderNumber,
              orderDate: order.createdAt,
              reviewed: false,
            });
          }
        }
      }
    }

    res.json({ reviewableProducts });
  } catch (error) {
    console.error('Error fetching reviewable products:', error);
    res.status(500).json({ error: 'Failed to fetch reviewable products' });
  }
};

// Helper function to update product rating
async function updateProductRating(productId: string) {
  try {
    const reviews = await Review.find({ productId }).lean();

    if (reviews.length === 0) {
      await Product.findByIdAndUpdate(productId, {
        rating: 0,
        reviewCount: 0,
      });
    } else {
      const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
      const averageRating = Math.round((totalRating / reviews.length) * 10) / 10;

      await Product.findByIdAndUpdate(productId, {
        rating: averageRating,
        reviewCount: reviews.length,
      });
    }
  } catch (error) {
    console.error('Error updating product rating:', error);
  }
}
