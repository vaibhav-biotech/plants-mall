import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import { uploadMiddleware } from '../middleware/upload.js';
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  bulkCreateProducts,
  getNewArrivals,
  getOfficeFriendly,
  getGiftProducts,
} from '../controllers/productController.js';

const router = express.Router();

// Collection filters (public routes)
router.get('/collections/new-arrivals', getNewArrivals);
router.get('/collections/office-friendly', getOfficeFriendly);
router.get('/collections/gifts', getGiftProducts);

router.get('/', getAllProducts);
router.get('/:id', getProductById);
router.post('/', authenticate, authorize(['admin', 'staff']), uploadMiddleware.single('image'), createProduct);
router.post('/bulk', authenticate, authorize(['admin', 'staff']), bulkCreateProducts);
router.put('/:id', authenticate, authorize(['admin', 'staff']), uploadMiddleware.single('image'), updateProduct);
router.delete('/:id', authenticate, authorize(['admin']), deleteProduct);

export default router;
