import express from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
  checkInWishlist,
} from '../controllers/wishlistController.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Wishlist routes
router.post('/', addToWishlist);
router.get('/', getWishlist);
router.delete('/:productId', removeFromWishlist);
router.get('/check/:productId', checkInWishlist);

export default router;
