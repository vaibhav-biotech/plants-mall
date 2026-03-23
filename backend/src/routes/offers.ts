import express from 'express';
import {
  getAllOffers,
  getActiveOffers,
  getOfferById,
  createOffer,
  updateOffer,
  deleteOffer,
  reorderOffers,
  toggleOfferStatus,
} from '../controllers/offerController';
import { authenticate, authorize } from '../middleware/auth';

const router = express.Router();

// Public routes
router.get('/active', getActiveOffers);
router.get('/', getAllOffers);
router.get('/:id', getOfferById);

// Admin routes
router.post('/', authenticate, authorize('admin'), createOffer);
router.put('/:id', authenticate, authorize('admin'), updateOffer);
router.delete('/:id', authenticate, authorize('admin'), deleteOffer);
router.post('/:id/toggle', authenticate, authorize('admin'), toggleOfferStatus);
router.post('/reorder', authenticate, authorize('admin'), reorderOffers);

export default router;
