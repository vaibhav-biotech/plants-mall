import express from 'express';
import uploadMiddleware from '../middleware/upload.js';
import {
  getAllBanners,
  getBannerById,
  createBanner,
  updateBanner,
  deleteBanner,
  reorderBanners
} from '../controllers/bannerController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', getAllBanners);
router.get('/:id', getBannerById);

// Admin routes
router.post('/', authenticate, authorize(['admin']), uploadMiddleware.single('file'), createBanner);
router.put('/:id', authenticate, authorize(['admin']), uploadMiddleware.single('file'), updateBanner);
router.delete('/:id', authenticate, authorize(['admin']), deleteBanner);
router.post('/reorder', authenticate, authorize(['admin']), reorderBanners);

export default router;
