import express from 'express';
import {
  getProductReviews,
  createReview,
  updateReview,
  deleteReview,
  getUserReviewableProducts,
} from '../controllers/reviewController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// Public routes
router.get('/product/:productId', getProductReviews);

// Protected routes (authenticated users)
router.post('/', authenticate, createReview);
router.get('/my/reviewable', authenticate, getUserReviewableProducts);
router.put('/:reviewId', authenticate, updateReview);
router.delete('/:reviewId', authenticate, deleteReview);

export default router;
